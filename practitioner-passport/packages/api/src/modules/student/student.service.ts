import { emitNewMessage } from "../../infrastructure/socket/socket.service";
import { HttpError } from "../../shared/errors/http.error";
import { AiCvGeneratorService } from "./ai-cv-generator.service";
import {
  AiCvRecord,
  ChatConversation,
  ChatMessage,
  CompetencyRecord,
  CvTone,
  DevelopmentRecord,
  PlacementRecord,
  PlacementStatus,
  PlacementType,
  QualificationRecord,
  StudentRepository,
} from "./student.repository";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEVELOPMENT_CATEGORIES = new Set(["Technical", "Communication", "Leadership", "Professional"]);

export class StudentService {
  constructor(
    private repository: StudentRepository,
    private aiCvGeneratorService: AiCvGeneratorService = new AiCvGeneratorService(),
  ) {}

  private readUserId(value: unknown): string {
    const userId = String(value || "").trim();
    if (!UUID_RE.test(userId)) {
      throw new HttpError(400, "Valid userId is required.");
    }
    return userId;
  }

  private readId(value: unknown): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, "Valid record id is required.");
    }
    return id;
  }

  async listCompetencies(userIdInput: unknown): Promise<CompetencyRecord[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listCompetencies(userId);
  }

  async createCompetency(payload: Record<string, unknown>): Promise<CompetencyRecord> {
    const userId = this.readUserId(payload.userId);
    const role = String(payload.role || "").trim();
    const attributes = payload.attributes as Record<string, number> | undefined;
    const submittedAt = String(payload.submittedAt || new Date().toISOString());
    if (!role) {
      throw new HttpError(400, "role is required.");
    }
    if (!attributes || typeof attributes !== "object") {
      throw new HttpError(400, "attributes are required.");
    }
    return this.repository.createCompetency({
      userId,
      role,
      attributes,
      submittedAt,
    });
  }

  async listQualifications(userIdInput: unknown): Promise<QualificationRecord[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listQualifications(userId);
  }

  async createQualification(payload: Record<string, unknown>): Promise<QualificationRecord> {
    const userId = this.readUserId(payload.userId);
    const title = String(payload.title || "").trim();
    const organisation = String(payload.organisation || "").trim();
    const year = String(payload.year || "").trim();
    if (!title || !organisation || !year) {
      throw new HttpError(400, "title, organisation and year are required.");
    }
    return this.repository.createQualification({ userId, title, organisation, year });
  }

  async deleteQualification(userIdInput: unknown, idInput: unknown): Promise<void> {
    const userId = this.readUserId(userIdInput);
    const id = this.readId(idInput);
    const deleted = await this.repository.deleteQualification(id, userId);
    if (!deleted) {
      throw new HttpError(404, "Qualification not found.");
    }
  }

  async listDevelopmentLogs(userIdInput: unknown): Promise<DevelopmentRecord[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listDevelopmentLogs(userId);
  }

  async createDevelopmentLog(payload: Record<string, unknown>): Promise<DevelopmentRecord> {
    const userId = this.readUserId(payload.userId);
    const skill = String(payload.skill || "").trim();
    const description = String(payload.description || "").trim();
    const date = String(payload.date || "").trim();
    if (!skill || !description || !date) {
      throw new HttpError(400, "skill, description and date are required.");
    }
    const hasCategory = payload.category != null && String(payload.category).trim() !== "";
    const categoryRaw = hasCategory ? String(payload.category).trim() : "Technical";
    if (!DEVELOPMENT_CATEGORIES.has(categoryRaw)) {
      throw new HttpError(400, "category must be Technical, Communication, Leadership, or Professional.");
    }
    const category = categoryRaw;
    return this.repository.createDevelopmentLog({
      userId,
      skill,
      category,
      description,
      date,
    });
  }

  async deleteDevelopmentLog(userIdInput: unknown, idInput: unknown): Promise<void> {
    const userId = this.readUserId(userIdInput);
    const id = this.readId(idInput);
    const deleted = await this.repository.deleteDevelopmentLog(id, userId);
    if (!deleted) {
      throw new HttpError(404, "Development entry not found.");
    }
  }

  async listPlacements(userIdInput: unknown): Promise<PlacementRecord[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listPlacements(userId);
  }

  async createPlacement(payload: Record<string, unknown>): Promise<PlacementRecord> {
    const userId = this.readUserId(payload.userId);
    const title = String(payload.title || "").trim();
    const organisation = String(payload.organisation || "").trim();
    const location = String(payload.location || "").trim();
    const type = String(payload.type || "").trim() as PlacementType;
    const startDate = String(payload.startDate || "").trim();
    const endDate = String(payload.endDate || "").trim();
    const status = String(payload.status || "").trim() as PlacementStatus;
    const description = String(payload.description || "").trim();
    if (!title || !organisation || !location || !startDate || !endDate || !description) {
      throw new HttpError(400, "title, organisation, location, startDate, endDate and description are required.");
    }
    const validTypes: PlacementType[] = ["Internship", "Part Time", "Full Time", "Work Experience"];
    const validStatuses: PlacementStatus[] = ["Pending", "Approved", "Rejected"];
    if (!validTypes.includes(type)) {
      throw new HttpError(400, "Invalid placement type.");
    }
    if (!validStatuses.includes(status)) {
      throw new HttpError(400, "Invalid placement status.");
    }
    return this.repository.createPlacement({
      userId,
      title,
      organisation,
      location,
      type,
      startDate,
      endDate,
      status,
      description,
    });
  }

  async deletePlacement(userIdInput: unknown, idInput: unknown): Promise<void> {
    const userId = this.readUserId(userIdInput);
    const id = this.readId(idInput);
    const deleted = await this.repository.deletePlacement(id, userId);
    if (!deleted) {
      throw new HttpError(404, "Placement not found.");
    }
  }

  async listCvGenerations(userIdInput: unknown): Promise<AiCvRecord[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listCvGenerations(userId);
  }

  async createCvGeneration(payload: Record<string, unknown>): Promise<AiCvRecord> {
    const userId = this.readUserId(payload.userId);
    const jobRole = String(payload.jobRole || "").trim();
    const tone = String(payload.tone || "").trim() as CvTone;
    const includeQualifications = Boolean(payload.includeQualifications);
    const includeDevelopment = Boolean(payload.includeDevelopment);
    const includePlacements = Boolean(payload.includePlacements);
    if (!jobRole) {
      throw new HttpError(400, "jobRole is required.");
    }
    const tones: CvTone[] = ["Professional", "Academic", "Creative"];
    if (!tones.includes(tone)) {
      throw new HttpError(400, "Invalid CV tone.");
    }

    const [competencies, qualifications, developmentLogs, placements] = await Promise.all([
      this.repository.listCompetencies(userId),
      this.repository.listQualifications(userId),
      this.repository.listDevelopmentLogs(userId),
      this.repository.listPlacements(userId),
    ]);

    const cvPreview = await this.aiCvGeneratorService.generateCvPreview({
      jobRole,
      tone,
      includeQualifications,
      includeDevelopment,
      includePlacements,
      competencies: competencies.map((item) => ({
        role: item.role,
        attributes: item.attributes,
      })),
      qualifications,
      developmentLogs,
      placements,
    });

    return this.repository.createCvGeneration({
      userId,
      jobRole,
      tone,
      includeQualifications,
      includeDevelopment,
      includePlacements,
      cvPreview,
    });
  }

  async submitCvToTeacher(userIdInput: unknown, cvIdInput: unknown): Promise<void> {
    const userId = this.readUserId(userIdInput);
    const cvId = this.readId(cvIdInput);
    const ok = await this.repository.submitCvToTeacher(cvId, userId);
    if (!ok) {
      throw new HttpError(404, "CV not found.");
    }
  }

  async listSubmittedCvs(): Promise<AiCvRecord[]> {
    return this.repository.listSubmittedCvs();
  }

  async listTeachers() {
    return this.repository.listTeachers();
  }

  async listConversations(userIdInput: unknown, role: "student" | "teacher"): Promise<ChatConversation[]> {
    const userId = this.readUserId(userIdInput);
    return this.repository.listConversations(userId, role);
  }

  async createConversation(payload: Record<string, unknown>): Promise<ChatConversation> {
    const studentId = this.readUserId(payload.studentId);
    const teacherId = this.readUserId(payload.teacherId);
    const title = String(payload.title || "New conversation").trim();
    return this.repository.createConversation(studentId, teacherId, title);
  }

  async deleteConversation(userIdInput: unknown, conversationIdInput: unknown): Promise<void> {
    const userId = this.readUserId(userIdInput);
    const conversationId = this.readId(conversationIdInput);
    const deleted = await this.repository.deleteConversation(conversationId, userId);
    if (!deleted) {
      throw new HttpError(404, "Conversation not found.");
    }
  }

  async listChatMessages(userIdInput: unknown, conversationIdInput: unknown): Promise<ChatMessage[]> {
    const userId = this.readUserId(userIdInput);
    const conversationId = this.readId(conversationIdInput);
    const isParticipant = await this.repository.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new HttpError(403, "You are not a participant in this conversation.");
    }
    return this.repository.listChatMessages(conversationId);
  }

  async sendChatMessage(payload: Record<string, unknown>): Promise<ChatMessage> {
    const senderId = this.readUserId(payload.senderId);
    const conversationId = this.readId(payload.conversationId);
    const message = String(payload.message || "").trim();
    if (!message) {
      throw new HttpError(400, "message is required.");
    }
    const isParticipant = await this.repository.isConversationParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new HttpError(403, "You are not a participant in this conversation.");
    }
    const msg = await this.repository.createChatMessage({ conversationId, senderId, message });
    await this.repository.touchConversation(conversationId);
    emitNewMessage(conversationId, msg);
    return msg;
  }
}
