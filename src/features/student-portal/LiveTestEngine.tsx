"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { isStudentHubDevice } from '@/lib/device.client';
import {
  Zap,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

type TestQuestion = {
  id: string;
  question: string;
  options: string[];
};

type LiveTest = {
  id?: string;
  title: string;
  subject: string;
  durationMinutes: number;
  startsAt?: string;
  endsAt?: string;
  questions: TestQuestion[];
};

type DeadlineLiveTest = LiveTest & {
  startsAt: string;
  endsAt: string;
};

type StudentProfile = {
  id: string;
  school_id: string;
  class_id: string | null;
};

type QueuedExamEvent = {
  eventId: string;
  deviceId: string;
  streamId: string;
  action: 'answer_saved' | 'test_submitted';
  lamportVersion: number;
  payload: Record<string, unknown>;
};

type SyncExamEvent = {
  eventId: string;
  schoolId: string;
  actorId: string;
  deviceId: string;
  streamType: 'exam';
  streamId: string;
  action: QueuedExamEvent['action'];
  lamportVersion: number;
  payload: Record<string, unknown>;
  schemaVersion: number;
  observedEventIds: string[];
};

type PersistedTestState = {
  test: LiveTest;
  answers: Record<string, string>;
  lamportVersion: number;
  queue: QueuedExamEvent[];
  submitted: boolean;
  acknowledged: boolean;
  timeLeft: number;
  startsAt: string;
  endsAt: string;
};

const STORAGE_PREFIX = 'eduportal.live-test';
const MAX_RETRY_DELAY_MS = 8000;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string) {
  const shuffled = [...items];
  const random = mulberry32(stableHash(seed));
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getTestId(test: LiveTest) {
  return test.id ?? stableHash(`${test.title}:${test.subject}:${test.questions.map(q => q.id).join('|')}`).toString(36);
}

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withServerDeadline(test: LiveTest, saved?: PersistedTestState | null): DeadlineLiveTest {
  const startsAt = saved?.startsAt ?? test.startsAt ?? new Date().toISOString();
  const endsAt = saved?.endsAt ?? test.endsAt ?? new Date(new Date(startsAt).getTime() + test.durationMinutes * 60_000).toISOString();
  return { ...test, startsAt, endsAt };
}

function secondsUntil(isoTime: string) {
  return Math.max(Math.ceil((new Date(isoTime).getTime() - Date.now()) / 1000), 0);
}

export default function LiveTestEngine({ classId }: { classId: string }) {
  const [testData, setTestData] = useState<LiveTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isStudentHub] = useState(() => isStudentHubDevice());
  const [supabase] = useState(() => createClient());
  const flushInFlight = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deviceId = useMemo(() => {
    if (typeof window === 'undefined') return 'student-hub-unknown';
    const existing = window.localStorage.getItem('eduportal.device-id');
    if (existing) return existing;
    const created = `student-hub-${randomId()}`;
    window.localStorage.setItem('eduportal.device-id', created);
    return created;
  }, []);

  const storageKey = useCallback((test: LiveTest) => {
    return `${STORAGE_PREFIX}.${classId}.${profile?.id ?? 'unknown'}.${getTestId(test)}`;
  }, [classId, profile?.id]);

  const persistState = useCallback((state: PersistedTestState) => {
    window.localStorage.setItem(storageKey(state.test), JSON.stringify(state));
    setPendingCount(state.queue.length);
  }, [storageKey]);

  const readState = useCallback((test: LiveTest): PersistedTestState | null => {
    const raw = window.localStorage.getItem(storageKey(test));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedTestState;
    } catch {
      return null;
    }
  }, [storageKey]);

  const randomizeTestForStudent = useCallback((test: LiveTest) => {
    const testId = getTestId(test);
    const studentSeed = `${profile?.id ?? deviceId}:${testId}`;
    return {
      ...test,
      id: testId,
      questions: seededShuffle(test.questions, `${studentSeed}:questions`).map(question => ({
        ...question,
        options: seededShuffle(question.options, `${studentSeed}:${question.id}:options`)
      }))
    };
  }, [deviceId, profile?.id]);

  const flushQueue = useCallback(async (test: LiveTest, forceJitter = false) => {
    if (!profile || flushInFlight.current) return false;
    flushInFlight.current = true;

    try {
      if (forceJitter) await sleep(250 + Math.floor(Math.random() * 2500));
      let state = readState(test);
      if (!state || state.queue.length === 0) {
        setPendingCount(0);
        return true;
      }

      while (state.queue.length > 0) {
        const batch: SyncExamEvent[] = state.queue.slice(0, 25).map(event => ({
          eventId: event.eventId,
          schoolId: profile.school_id,
          actorId: profile.id,
          deviceId: event.deviceId,
          streamType: 'exam',
          streamId: event.streamId,
          action: event.action,
          lamportVersion: event.lamportVersion,
          payload: event.payload,
          schemaVersion: 1,
          observedEventIds: []
        }));

        const response = await fetch('/api/sync/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch })
        });

        if (!response.ok) throw new Error('Class Station is busy.');

        state = {
          ...state,
          queue: state.queue.slice(batch.length),
          acknowledged: state.submitted && state.queue.length <= batch.length
        };
        persistState(state);
      }

      if (state.submitted) {
        setIsFinished(true);
        setIsSubmitting(false);
      }

      return true;
    } catch {
      const delay = 500 + Math.floor(Math.random() * MAX_RETRY_DELAY_MS);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(() => void flushQueue(test, true), delay);
      return false;
    } finally {
      flushInFlight.current = false;
    }
  }, [persistState, profile, readState]);

  const enqueueEvent = useCallback((test: LiveTest, event: Omit<QueuedExamEvent, 'eventId' | 'deviceId' | 'streamId'>) => {
    const existing = readState(test);
    const deadlineTest = withServerDeadline(test, existing);
    const state: PersistedTestState = existing ?? {
      test: deadlineTest,
      answers: {},
      lamportVersion: 0,
      queue: [],
      submitted: false,
      acknowledged: false,
      timeLeft: secondsUntil(deadlineTest.endsAt),
      startsAt: deadlineTest.startsAt,
      endsAt: deadlineTest.endsAt
    };
    const streamId = `${getTestId(test)}:${profile?.id ?? deviceId}`;

    persistState({
      ...state,
      lamportVersion: event.lamportVersion,
      queue: [
        ...state.queue,
        {
          ...event,
          eventId: randomId(),
          deviceId,
          streamId
        }
      ],
      timeLeft: secondsUntil(deadlineTest.endsAt)
    });

    void flushQueue(test);
  }, [deviceId, flushQueue, persistState, profile?.id, readState]);

  const handleAnswer = useCallback((question: TestQuestion, option: string) => {
    if (!testData) return;
    const previous = readState(testData);
    const nextLamport = (previous?.lamportVersion ?? 0) + 1;
    const nextAnswers = { ...(previous?.answers ?? answers), [question.id]: option };

    setAnswers(nextAnswers);
    persistState({
      test: withServerDeadline(testData, previous),
      answers: nextAnswers,
      lamportVersion: nextLamport,
      queue: previous?.queue ?? [],
      submitted: false,
      acknowledged: false,
      timeLeft,
      startsAt: previous?.startsAt ?? testData.startsAt ?? new Date().toISOString(),
      endsAt: previous?.endsAt ?? testData.endsAt ?? new Date(Date.now() + testData.durationMinutes * 60_000).toISOString()
    });
    enqueueEvent(testData, {
      action: 'answer_saved',
      lamportVersion: nextLamport,
      payload: {
        test_id: getTestId(testData),
        class_id: classId,
        question_id: question.id,
        answer: option,
        answered_count: Object.keys(nextAnswers).length
      }
    });
  }, [answers, classId, enqueueEvent, persistState, readState, testData, timeLeft]);

  const handleSubmit = useCallback(async () => {
    if (!isStudentHub || !testData || isSubmitting) return;
    const previous = readState(testData);
    const nextLamport = (previous?.lamportVersion ?? 0) + 1;
    const finalAnswers = previous?.answers ?? answers;
    const deadlineTest = withServerDeadline(testData, previous);
    const now = new Date();
    const endsAt = new Date(deadlineTest.endsAt);

    setIsSubmitting(true);
    persistState({
      test: deadlineTest,
      answers: finalAnswers,
      lamportVersion: nextLamport,
      queue: previous?.queue ?? [],
      submitted: true,
      acknowledged: false,
      timeLeft: secondsUntil(deadlineTest.endsAt),
      startsAt: deadlineTest.startsAt,
      endsAt: deadlineTest.endsAt
    });
    enqueueEvent(testData, {
      action: 'test_submitted',
      lamportVersion: nextLamport,
      payload: {
        test_id: getTestId(testData),
        class_id: classId,
        answers: finalAnswers,
        answered_count: Object.keys(finalAnswers).length,
        total_questions: testData.questions.length,
        starts_at: deadlineTest.startsAt,
        ends_at: deadlineTest.endsAt,
        submitted_at: now.toISOString(),
        server_timer_enforced: true,
        late_by_seconds: Math.max(Math.ceil((now.getTime() - endsAt.getTime()) / 1000), 0)
      }
    });
    void flushQueue(testData, true);
  }, [answers, classId, enqueueEvent, flushQueue, isStudentHub, isSubmitting, persistState, readState, testData]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, school_id, class_id')
        .eq('id', user.id)
        .single();

      if (data?.school_id) setProfile(data as StudentProfile);
    };

    void loadProfile();
  }, [supabase]);

  const liveTestTopic = useMemo(() => {
    if (!profile) return null;
    const profileClass = profile.class_id ?? classId;
    return `private:school:${profile.school_id}:class:${profileClass}:student:${profile.id}`;
  }, [classId, profile]);

  useEffect(() => {
    if (!profile || !liveTestTopic) return;

    const channel = supabase.channel(liveTestTopic, { config: { private: true } })
      .on('broadcast', { event: 'DEPLOY_TEST' }, ({ payload }: { payload: LiveTest }) => {
        const randomizedTest = randomizeTestForStudent(payload);
        const saved = readState(randomizedTest);
        const studentTest = withServerDeadline(randomizedTest, saved);
        setTimeLeft(secondsUntil(studentTest.endsAt));
        setTestData(studentTest);
        setIsFinished(Boolean(saved?.acknowledged));
        setIsSubmitting(Boolean(saved?.submitted && !saved.acknowledged));
        setAnswers(saved?.answers ?? {});
        setPendingCount(saved?.queue.length ?? 0);
        if (saved?.queue.length) void flushQueue(studentTest, true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flushQueue, liveTestTopic, profile, randomizeTestForStudent, readState, supabase]);

  useEffect(() => {
    if (!profile) return;
    const states = Object.keys(window.localStorage)
      .filter(key => key.startsWith(`${STORAGE_PREFIX}.${classId}.${profile.id}.`))
      .map(key => {
        try {
          return JSON.parse(window.localStorage.getItem(key) ?? '') as PersistedTestState;
        } catch {
          return null;
        }
      })
      .filter((state): state is PersistedTestState => Boolean(state));
    const saved = states.find(state => !state.acknowledged);

    if (!saved) return;
    const restoredTest = withServerDeadline(saved.test, saved);
    setTestData(restoredTest);
    setAnswers(saved.answers);
    setTimeLeft(secondsUntil(restoredTest.endsAt));
    setIsSubmitting(saved.submitted);
    setPendingCount(saved.queue.length);
    void flushQueue(saved.test, true);
  }, [classId, flushQueue, profile]);

  useEffect(() => {
    if (!testData || isFinished) return;

    const timer = setInterval(() => {
      const state = readState(testData);
      const endsAt = state?.endsAt ?? testData.endsAt;
      if (!endsAt) return;
      const next = secondsUntil(endsAt);
      setTimeLeft(next);
      if (state) persistState({ ...state, timeLeft: next });
    }, 1000);
    return () => clearInterval(timer);
  }, [testData, isFinished, persistState, readState]);

  useEffect(() => {
    if (timeLeft === 0 && testData && !isFinished) {
      const submitTimer = setTimeout(() => {
        void handleSubmit();
      }, 0);
      return () => clearTimeout(submitTimer);
    }
  }, [timeLeft, testData, isFinished, handleSubmit]);

  useEffect(() => {
    const onOnline = () => {
      if (testData) void flushQueue(testData, true);
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue, testData]);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  if (!isStudentHub) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
        <div className="bg-warning/10 p-8 rounded-[3rem] border border-warning/20">
          <AlertCircle className="w-20 h-20 text-warning" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-black text-white">Student Hub Device Required</h3>
          <p className="text-muted max-w-md">For safety, exams, tests, and quizzes can only be answered on the assigned Student Hub device.</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!testData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-pulse">
        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
          <Zap className="w-20 h-20 text-muted opacity-20" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-muted">Awaiting Live Test</h3>
          <p className="text-muted/50 text-sm max-w-xs">Your teacher has not deployed a test yet. Please stay on this screen to receive the broadcast.</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in zoom-in duration-500">
        <div className="bg-success/20 p-8 rounded-[3rem] border border-success/30">
          <CheckCircle className="w-20 h-20 text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-black text-white">Assessment Complete</h3>
          <p className="text-muted">Your answers have a station receipt and remain in the local exam vault.</p>
        </div>
        <button
          onClick={() => setTestData(null)}
          className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-700">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{testData.title}</h2>
            <p className="text-xs text-muted uppercase tracking-widest font-bold">{testData.subject} - {testData.questions.length} Questions</p>
          </div>
        </div>

        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-colors ${timeLeft < 60 ? 'bg-danger/20 border-danger text-danger animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
          <Clock className="w-5 h-5" />
          <span className="text-2xl font-black font-mono">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-8">
        {testData.questions.map((q, idx) => (
          <div key={q.id} className="bg-card border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-white mb-8 leading-relaxed">{q.question}</p>

                <div className="grid grid-cols-2 gap-4">
                  {q.options.map((opt: string, i: number) => (
                    <button
                      key={`${q.id}-${opt}`}
                      onClick={() => handleAnswer(q, opt)}
                      className={`p-6 rounded-3xl border text-left transition-all text-lg font-medium active:scale-95 ${answers[q.id] === opt ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10 text-muted'}`}
                    >
                      <span className="opacity-40 mr-3">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pendingCount > 0 ? <Loader2 className="w-5 h-5 text-warning animate-spin" /> : <CheckCircle className="w-5 h-5 text-success" />}
          <p className="text-sm text-muted">
            {pendingCount > 0 ? `${pendingCount} saved change${pendingCount === 1 ? '' : 's'} waiting for station receipt.` : 'Every answer is saved locally and synced to the station.'}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn btn-primary px-12 py-4 rounded-2xl text-lg gap-3"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSubmitting ? 'Waiting for Receipt...' : 'Submit Final Draft'}
        </button>
      </footer>
    </div>
  );
}
