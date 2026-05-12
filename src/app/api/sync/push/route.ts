import { NextResponse } from "next/server";
import { requireUser, errorMessage } from "@/lib/api-auth";
import { promisify } from "util";
import * as zlib from "zlib";

const brotliDecompress = promisify(zlib.brotliDecompress);

// Compare two vector clocks
// Returns 'v1' if v1 dominates, 'v2' if v2 dominates, 'equal' if same, 'concurrent' if conflict
function compareVectors(v1: Record<string, number>, v2: Record<string, number>) {
  let v1Dominates = false;
  let v2Dominates = false;

  const keys = new Set([...Object.keys(v1), ...Object.keys(v2)]);

  for (const key of keys) {
    const val1 = v1[key] || 0;
    const val2 = v2[key] || 0;

    if (val1 > val2) v1Dominates = true;
    if (val2 > val1) v2Dominates = true;
  }

  if (v1Dominates && !v2Dominates) return "v1";
  if (v2Dominates && !v1Dominates) return "v2";
  if (!v1Dominates && !v2Dominates) return "equal";
  return "concurrent";
}

// Basic JSON Patch applying for shallow DB records
function applyJsonPatch(doc: any, patch: any[]) {
  const result = { ...doc };
  for (const op of patch) {
    if (!op.path) continue;
    const key = op.path.startsWith("/") ? op.path.substring(1) : op.path;
    if (op.op === "replace" || op.op === "add" || op.op === "set") {
      result[key] = op.value;
    } else if (op.op === "remove") {
      result[key] = null;
    }
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin", "principal", "teacher", "moderator", "student"]);
    if (!auth.ok) return auth.response;

    const rawBody = await req.arrayBuffer();
    const encoding = req.headers.get("content-encoding");

    let payloadString = "";
    if (encoding === "br") {
      const decompressed = await brotliDecompress(Buffer.from(rawBody));
      payloadString = decompressed.toString("utf-8");
    } else {
      payloadString = Buffer.from(rawBody).toString("utf-8");
    }

    const payload = JSON.parse(payloadString);
    const { table, id, changes, _version_vector: edgeVector, updated_at: edgeUpdatedAt } = payload;

    if (!table || !id || !changes || !edgeVector || !edgeUpdatedAt) {
      return NextResponse.json({ error: "Missing required sync fields" }, { status: 400 });
    }

    const diffData = Array.isArray(changes) ? applyJsonPatch({}, changes) : changes;

    // List of allowed syncable tables
    const allowedTables = ["assignments", "submissions", "attendance", "hpc_grades", "materials", "exam_papers", "certifications"];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: "Table not syncable" }, { status: 400 });
    }

    const { data: cloudRow, error: fetchError } = await auth.context.supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // If row doesn't exist in cloud, just insert it
    if (!cloudRow) {
      const { error: insertError } = await auth.context.supabase
        .from(table)
        .insert({
          id,
          ...diffData,
          _version_vector: edgeVector,
          updated_at: edgeUpdatedAt,
        });

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
      return NextResponse.json({ status: "inserted" });
    }

    const cloudVector = cloudRow._version_vector || {};
    const cloudUpdatedAt = new Date(cloudRow.updated_at || 0).getTime();
    const edgeTime = new Date(edgeUpdatedAt).getTime();

    const comparison = compareVectors(edgeVector, cloudVector);

    let shouldApply = false;

    // Role-based override: Admin cloud edits deterministically win over edge teacher edits
    if (auth.context.profile.role !== "admin" && cloudRow.last_edited_by_role === "admin") {
       shouldApply = false; 
    } else {
      if (comparison === "v1") {
        // Edge dominates
        shouldApply = true;
      } else if (comparison === "v2") {
        // Cloud dominates
        shouldApply = false;
      } else if (comparison === "concurrent") {
        // Conflict -> fallback to HLC (LWW)
        if (edgeTime > cloudUpdatedAt) {
          shouldApply = true;
        } else {
          shouldApply = false;
        }
      }
    }

    if (shouldApply) {
      // Merge vectors (take max of each node)
      const mergedVector: Record<string, number> = { ...cloudVector };
      for (const [node, count] of Object.entries(edgeVector as Record<string, number>)) {
        mergedVector[node] = Math.max(mergedVector[node] || 0, count);
      }

      const { error: updateError } = await auth.context.supabase
        .from(table)
        .update({
          ...diffData,
          _version_vector: mergedVector,
          updated_at: edgeUpdatedAt,
        })
        .eq("id", id);

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      return NextResponse.json({ status: "merged_edge_wins" });
    }

    return NextResponse.json({ status: "rejected_cloud_wins" });

  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
