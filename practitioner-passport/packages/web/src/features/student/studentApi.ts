const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type ApiResponse<T> = {
  data: T;
};

type ApiError = {
  message?: string;
  error?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const data = (await response.json()) as ApiError;
      if (data.message?.trim()) message = data.message;
      if (data.error?.trim()) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export type CompetencyRecord = {
  id: number;
  userId: string;
  role: string;
  attributes: Record<string, number>;
  submittedAt: string;
};

export type QualificationRecord = {
  id: number;
  userId: string;
  title: string;
  organisation: string;
  year: string;
};

export type DevelopmentRecord = {
  id: number;
  userId: string;
  skill: string;
  description: string;
  date: string;
};

export type PlacementStatus = "Pending" | "Approved" | "Rejected";
export type PlacementType = "Internship" | "Part Time" | "Full Time" | "Work Experience";

export type PlacementRecord = {
  id: number;
  userId: string;
  title: string;
  organisation: string;
  location: string;
  type: PlacementType;
  startDate: string;
  endDate: string;
  status: PlacementStatus;
  description: string;
};

export type CvTone = "Professional" | "Academic" | "Creative";

export type AiCvRecord = {
  id: number;
  userId: string;
  jobRole: string;
  tone: CvTone;
  includeQualifications: boolean;
  includeDevelopment: boolean;
  includePlacements: boolean;
  cvPreview: {
    summary?: string;
    skills?: string[];
    qualifications?: string[];
    development?: string[];
    placements?: string[];
    [key: string]: unknown;
  };
  createdAt: string;
};

function withUser(path: string, userId: string): string {
  const encoded = encodeURIComponent(userId);
  return `${path}?userId=${encoded}`;
}

export async function listCompetencies(userId: string): Promise<CompetencyRecord[]> {
  const res = await request<ApiResponse<CompetencyRecord[]>>(withUser("/bff/student/competencies", userId));
  return res.data;
}

export async function createCompetency(
  payload: Omit<CompetencyRecord, "id" | "submittedAt"> & { submittedAt?: string },
): Promise<CompetencyRecord> {
  const res = await request<ApiResponse<CompetencyRecord>>("/bff/student/competencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listQualifications(userId: string): Promise<QualificationRecord[]> {
  const res = await request<ApiResponse<QualificationRecord[]>>(withUser("/bff/student/qualifications", userId));
  return res.data;
}

export async function createQualification(payload: Omit<QualificationRecord, "id">): Promise<QualificationRecord> {
  const res = await request<ApiResponse<QualificationRecord>>("/bff/student/qualifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteQualification(userId: string, id: number): Promise<void> {
  await request(withUser(`/bff/student/qualifications/${id}`, userId), {
    method: "DELETE",
  });
}

export async function listDevelopmentLogs(userId: string): Promise<DevelopmentRecord[]> {
  const res = await request<ApiResponse<DevelopmentRecord[]>>(withUser("/bff/student/development", userId));
  return res.data;
}

export async function createDevelopmentLog(payload: Omit<DevelopmentRecord, "id">): Promise<DevelopmentRecord> {
  const res = await request<ApiResponse<DevelopmentRecord>>("/bff/student/development", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteDevelopmentLog(userId: string, id: number): Promise<void> {
  await request(withUser(`/bff/student/development/${id}`, userId), {
    method: "DELETE",
  });
}

export async function listPlacements(userId: string): Promise<PlacementRecord[]> {
  const res = await request<ApiResponse<PlacementRecord[]>>(withUser("/bff/student/placements", userId));
  return res.data;
}

export async function createPlacement(payload: Omit<PlacementRecord, "id">): Promise<PlacementRecord> {
  const res = await request<ApiResponse<PlacementRecord>>("/bff/student/placements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletePlacement(userId: string, id: number): Promise<void> {
  await request(withUser(`/bff/student/placements/${id}`, userId), {
    method: "DELETE",
  });
}

export async function listAiCvGenerations(userId: string): Promise<AiCvRecord[]> {
  const res = await request<ApiResponse<AiCvRecord[]>>(withUser("/bff/student/ai-cv", userId));
  return res.data;
}

export async function createAiCvGeneration(payload: Omit<AiCvRecord, "id" | "createdAt">): Promise<AiCvRecord> {
  const res = await request<ApiResponse<AiCvRecord>>("/bff/student/ai-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}
