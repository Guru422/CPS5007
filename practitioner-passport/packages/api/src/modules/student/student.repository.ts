import { PostgresService } from "../../infrastructure/database/postgres.service";

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
  category: string;
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
  cvPreview: Record<string, unknown>;
  submittedToTeacher: boolean;
  createdAt: string;
  studentName?: string;
};

export type ChatConversation = {
  id: number;
  studentId: string;
  teacherId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  participantName?: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: string;
  senderName?: string;
  message: string;
  createdAt: string;
};

export class StudentRepository {
  constructor(private db: PostgresService) {}

  async listCompetencies(userId: string): Promise<CompetencyRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      role: string;
      attributes: Record<string, number>;
      submitted_at: Date | string;
    }>(
      `SELECT id, user_id, role, attributes, submitted_at
       FROM student_competencies
       WHERE user_id = $1
       ORDER BY submitted_at DESC`,
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      attributes: row.attributes,
      submittedAt: new Date(row.submitted_at).toISOString(),
    }));
  }

  async createCompetency(record: Omit<CompetencyRecord, "id">): Promise<CompetencyRecord> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      role: string;
      attributes: Record<string, number>;
      submitted_at: Date | string;
    }>(
      `INSERT INTO student_competencies (user_id, role, attributes, submitted_at)
       VALUES ($1, $2, $3::jsonb, $4::timestamptz)
       RETURNING id, user_id, role, attributes, submitted_at`,
      [record.userId, record.role, JSON.stringify(record.attributes), record.submittedAt],
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      role: row.role,
      attributes: row.attributes,
      submittedAt: new Date(row.submitted_at).toISOString(),
    };
  }

  async listQualifications(userId: string): Promise<QualificationRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      title: string;
      organisation: string;
      year: string;
    }>(
      `SELECT id, user_id, title, organisation, year
       FROM student_qualifications
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId],
    );
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      organisation: row.organisation,
      year: row.year,
    }));
  }

  async createQualification(record: Omit<QualificationRecord, "id">): Promise<QualificationRecord> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      title: string;
      organisation: string;
      year: string;
    }>(
      `INSERT INTO student_qualifications (user_id, title, organisation, year)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, organisation, year`,
      [record.userId, record.title, record.organisation, record.year],
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      organisation: row.organisation,
      year: row.year,
    };
  }

  async deleteQualification(id: number, userId: string): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM student_qualifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async listDevelopmentLogs(userId: string): Promise<DevelopmentRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      skill: string;
      category: string;
      description: string;
      development_date: Date | string;
    }>(
      `SELECT id, user_id, skill, category, description, development_date
       FROM student_development_logs
       WHERE user_id = $1
       ORDER BY development_date DESC, id DESC`,
      [userId],
    );
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      skill: row.skill,
      category: row.category,
      description: row.description,
      date: new Date(row.development_date).toISOString().slice(0, 10),
    }));
  }

  async createDevelopmentLog(record: Omit<DevelopmentRecord, "id">): Promise<DevelopmentRecord> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      skill: string;
      category: string;
      description: string;
      development_date: Date | string;
    }>(
      `INSERT INTO student_development_logs (user_id, skill, category, description, development_date)
       VALUES ($1, $2, $3, $4, $5::date)
       RETURNING id, user_id, skill, category, description, development_date`,
      [record.userId, record.skill, record.category, record.description, record.date],
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      skill: row.skill,
      category: row.category,
      description: row.description,
      date: new Date(row.development_date).toISOString().slice(0, 10),
    };
  }

  async deleteDevelopmentLog(id: number, userId: string): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM student_development_logs WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async listPlacements(userId: string): Promise<PlacementRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      title: string;
      organisation: string;
      location: string;
      type: PlacementType;
      start_date: Date | string;
      end_date: Date | string;
      status: PlacementStatus;
      description: string;
    }>(
      `SELECT id, user_id, title, organisation, location, type, start_date, end_date, status, description
       FROM student_placements
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      organisation: row.organisation,
      location: row.location,
      type: row.type,
      startDate: new Date(row.start_date).toISOString().slice(0, 10),
      endDate: new Date(row.end_date).toISOString().slice(0, 10),
      status: row.status,
      description: row.description,
    }));
  }

  async createPlacement(record: Omit<PlacementRecord, "id">): Promise<PlacementRecord> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      title: string;
      organisation: string;
      location: string;
      type: PlacementType;
      start_date: Date | string;
      end_date: Date | string;
      status: PlacementStatus;
      description: string;
    }>(
      `INSERT INTO student_placements (
         user_id, title, organisation, location, type, start_date, end_date, status, description
       ) VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, $8, $9)
       RETURNING id, user_id, title, organisation, location, type, start_date, end_date, status, description`,
      [
        record.userId,
        record.title,
        record.organisation,
        record.location,
        record.type,
        record.startDate,
        record.endDate,
        record.status,
        record.description,
      ],
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      organisation: row.organisation,
      location: row.location,
      type: row.type,
      startDate: new Date(row.start_date).toISOString().slice(0, 10),
      endDate: new Date(row.end_date).toISOString().slice(0, 10),
      status: row.status,
      description: row.description,
    };
  }

  async deletePlacement(id: number, userId: string): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM student_placements WHERE id = $1 AND user_id = $2`, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async listCvGenerations(userId: string): Promise<AiCvRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      job_role: string;
      tone: CvTone;
      include_qualifications: boolean;
      include_development: boolean;
      include_placements: boolean;
      cv_preview: Record<string, unknown>;
      submitted_to_teacher: boolean;
      created_at: Date | string;
    }>(
      `SELECT id, user_id, job_role, tone, include_qualifications, include_development, include_placements, cv_preview, submitted_to_teacher, created_at
       FROM student_ai_cv_generations
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      jobRole: row.job_role,
      tone: row.tone,
      includeQualifications: row.include_qualifications,
      includeDevelopment: row.include_development,
      includePlacements: row.include_placements,
      cvPreview: row.cv_preview,
      submittedToTeacher: row.submitted_to_teacher,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  async createCvGeneration(record: Omit<AiCvRecord, "id" | "createdAt" | "submittedToTeacher" | "studentName">): Promise<AiCvRecord> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      job_role: string;
      tone: CvTone;
      include_qualifications: boolean;
      include_development: boolean;
      include_placements: boolean;
      cv_preview: Record<string, unknown>;
      submitted_to_teacher: boolean;
      created_at: Date | string;
    }>(
      `INSERT INTO student_ai_cv_generations (
         user_id, job_role, tone, include_qualifications, include_development, include_placements, cv_preview
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, user_id, job_role, tone, include_qualifications, include_development, include_placements, cv_preview, submitted_to_teacher, created_at`,
      [
        record.userId,
        record.jobRole,
        record.tone,
        record.includeQualifications,
        record.includeDevelopment,
        record.includePlacements,
        JSON.stringify(record.cvPreview),
      ],
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      jobRole: row.job_role,
      tone: row.tone,
      includeQualifications: row.include_qualifications,
      includeDevelopment: row.include_development,
      includePlacements: row.include_placements,
      cvPreview: row.cv_preview,
      submittedToTeacher: row.submitted_to_teacher,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  async submitCvToTeacher(cvId: number, userId: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE student_ai_cv_generations SET submitted_to_teacher = TRUE WHERE id = $1 AND user_id = $2`,
      [cvId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async listSubmittedCvs(): Promise<AiCvRecord[]> {
    const { rows } = await this.db.query<{
      id: number;
      user_id: string;
      job_role: string;
      tone: CvTone;
      include_qualifications: boolean;
      include_development: boolean;
      include_placements: boolean;
      cv_preview: Record<string, unknown>;
      submitted_to_teacher: boolean;
      created_at: Date | string;
      student_name: string;
    }>(
      `SELECT g.id, g.user_id, g.job_role, g.tone, g.include_qualifications, g.include_development,
              g.include_placements, g.cv_preview, g.submitted_to_teacher, g.created_at,
              u.full_name AS student_name
       FROM student_ai_cv_generations g
       JOIN users u ON u.id = g.user_id
       WHERE g.submitted_to_teacher = TRUE
       ORDER BY g.created_at DESC`,
    );
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      jobRole: row.job_role,
      tone: row.tone,
      includeQualifications: row.include_qualifications,
      includeDevelopment: row.include_development,
      includePlacements: row.include_placements,
      cvPreview: row.cv_preview,
      submittedToTeacher: row.submitted_to_teacher,
      createdAt: new Date(row.created_at).toISOString(),
      studentName: row.student_name,
    }));
  }

  async listTeachers(): Promise<Array<{ id: string; fullName: string; email: string }>> {
    const { rows } = await this.db.query<{ id: string; full_name: string; email: string }>(
      `SELECT id, full_name, email FROM users WHERE role = 'teacher' AND verified_at IS NOT NULL ORDER BY full_name`,
    );
    return rows.map((r) => ({ id: r.id, fullName: r.full_name, email: r.email }));
  }

  async listConversations(userId: string, role: "student" | "teacher"): Promise<ChatConversation[]> {
    const col = role === "student" ? "student_id" : "teacher_id";
    const otherCol = role === "student" ? "teacher_id" : "student_id";
    const { rows } = await this.db.query<{
      id: number;
      student_id: string;
      teacher_id: string;
      title: string;
      created_at: Date | string;
      updated_at: Date | string;
      participant_name: string;
    }>(
      `SELECT c.id, c.student_id, c.teacher_id, c.title, c.created_at, c.updated_at,
              u.full_name AS participant_name
       FROM chat_conversations c
       JOIN users u ON u.id = c.${otherCol}
       WHERE c.${col} = $1
       ORDER BY c.updated_at DESC`,
      [userId],
    );
    return rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      teacherId: row.teacher_id,
      title: row.title,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      participantName: row.participant_name,
    }));
  }

  async createConversation(studentId: string, teacherId: string, title: string): Promise<ChatConversation> {
    const { rows } = await this.db.query<{
      id: number;
      student_id: string;
      teacher_id: string;
      title: string;
      created_at: Date | string;
      updated_at: Date | string;
    }>(
      `INSERT INTO chat_conversations (student_id, teacher_id, title)
       VALUES ($1, $2, $3)
       RETURNING id, student_id, teacher_id, title, created_at, updated_at`,
      [studentId, teacherId, title],
    );
    const row = rows[0];
    return {
      id: row.id,
      studentId: row.student_id,
      teacherId: row.teacher_id,
      title: row.title,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async deleteConversation(conversationId: number, userId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM chat_conversations WHERE id = $1 AND (student_id = $2 OR teacher_id = $2)`,
      [conversationId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async isConversationParticipant(conversationId: number, userId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ id: number }>(
      `SELECT id FROM chat_conversations WHERE id = $1 AND (student_id = $2 OR teacher_id = $2)`,
      [conversationId, userId],
    );
    return rows.length > 0;
  }

  async touchConversation(conversationId: number): Promise<void> {
    await this.db.query(`UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
  }

  async listChatMessages(conversationId: number, limit = 200): Promise<ChatMessage[]> {
    const { rows } = await this.db.query<{
      id: number;
      conversation_id: number;
      sender_id: string;
      sender_name: string;
      message: string;
      created_at: Date | string;
    }>(
      `SELECT m.id, m.conversation_id, m.sender_id, u.full_name AS sender_name, m.message, m.created_at
       FROM chat_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [conversationId, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      message: row.message,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  async createChatMessage(payload: {
    conversationId: number;
    senderId: string;
    message: string;
  }): Promise<ChatMessage> {
    const { rows } = await this.db.query<{
      id: number;
      conversation_id: number;
      sender_id: string;
      message: string;
      created_at: Date | string;
    }>(
      `INSERT INTO chat_messages (conversation_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, message, created_at`,
      [payload.conversationId, payload.senderId, payload.message],
    );
    const row = rows[0];
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      message: row.message,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}
