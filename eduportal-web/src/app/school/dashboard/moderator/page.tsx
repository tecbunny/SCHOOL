"use client";

import { UploadCloud, FileText, FolderUp, HardDrive, Search, Edit, Trash2, Video, Check } from 'lucide-react';
import { ChatDrawer } from '@/components/school/ClassroomTools';

export default function ModeratorDashboard() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary"><UploadCloud className="w-4 h-4" /> Upload Material</button>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8 flex-1">
        <div className="grid grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              TOTAL SYLLABUS FILES <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-value">24</div>
            <div className="text-xs text-muted">Indexed for AI Generation</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              PENDING APPROVALS <FolderUp className="w-4 h-4 text-secondary" />
            </div>
            <div className="stat-value text-secondary">3</div>
            <div className="text-xs text-muted">Materials uploaded by teachers</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              STORAGE USAGE <HardDrive className="w-4 h-4 text-success" />
            </div>
            <div className="stat-value">4.2 GB</div>
            <div className="text-xs text-success flex items-center gap-1">Out of 10 GB limit</div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
            <h3 className="font-bold text-lg">Recent Materials & Textbooks</h3>
            <div className="flex items-center bg-[var(--bg-dark)] border border-[var(--border)] rounded-md px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-muted mr-2" />
              <input type="text" placeholder="Search files..." className="w-full bg-transparent border-none text-white text-sm outline-none" />
            </div>
          </div>
          
          <div className="table-wrapper mt-2">
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Subject & Class</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Class_10_Math_Syllabus.pdf
                    </div>
                    <div className="text-xs text-muted mt-1">Uploaded 2 days ago</div>
                  </td>
                  <td>Mathematics (10-A, 10-B)</td>
                  <td><span className="badge badge-neutral">Syllabus</span></td>
                  <td><span className="text-success flex items-center gap-1 text-xs"><Check className="w-3 h-3" /> AI Indexed</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-primary hover:text-white"><Edit className="w-4 h-4" /></button>
                      <button className="text-danger hover:text-white"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-secondary" />
                      Laws_of_Motion_L1.mp4
                    </div>
                    <div className="text-xs text-muted mt-1">Uploaded by T000002 today</div>
                  </td>
                  <td>Science (10-A)</td>
                  <td><span className="badge badge-neutral">Video Lecture</span></td>
                  <td><span className="badge badge-warning">Pending Review</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline text-xs py-1 px-2">Approve</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ChatDrawer title="School Chat (Staff)" />
    </>
  );
}
