import { Router } from "express";
import { StudentController } from "./student.controller";

export function createStudentRouter(controller: StudentController) {
  const router = Router();

  router.get("/competencies", controller.listCompetencies);
  router.post("/competencies", controller.createCompetency);

  router.get("/qualifications", controller.listQualifications);
  router.post("/qualifications", controller.createQualification);
  router.delete("/qualifications/:id", controller.deleteQualification);

  router.get("/development", controller.listDevelopmentLogs);
  router.post("/development", controller.createDevelopmentLog);
  router.delete("/development/:id", controller.deleteDevelopmentLog);

  router.get("/placements", controller.listPlacements);
  router.post("/placements", controller.createPlacement);
  router.delete("/placements/:id", controller.deletePlacement);

  router.get("/ai-cv", controller.listAiCvGenerations);
  router.post("/ai-cv", controller.createAiCvGeneration);
  router.patch("/ai-cv/:id/submit", controller.submitCvToTeacher);
  router.get("/ai-cv/submitted", controller.listSubmittedCvs);
  router.get("/chat/teachers", controller.listTeachers);
  router.get("/chat/conversations", controller.listConversations);
  router.post("/chat/conversations", controller.createConversation);
  router.delete("/chat/conversations/:id", controller.deleteConversation);
  router.get("/chat/conversations/:conversationId/messages", controller.listChatMessages);
  router.post("/chat/messages", controller.sendChatMessage);

  return router;
}
