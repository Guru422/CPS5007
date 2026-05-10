import { NextFunction, Request, Response } from "express";
import { StudentService } from "./student.service";

export class StudentController {
  constructor(private service: StudentService) {}

  listCompetencies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listCompetencies(req.query.userId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createCompetency = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createCompetency(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  listQualifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listQualifications(req.query.userId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createQualification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createQualification(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  deleteQualification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteQualification(req.query.userId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  listDevelopmentLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listDevelopmentLogs(req.query.userId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createDevelopmentLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createDevelopmentLog(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  deleteDevelopmentLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteDevelopmentLog(req.query.userId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  listPlacements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listPlacements(req.query.userId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createPlacement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createPlacement(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  deletePlacement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePlacement(req.query.userId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  listAiCvGenerations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listCvGenerations(req.query.userId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createAiCvGeneration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createCvGeneration(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  submitCvToTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.submitCvToTeacher(req.query.userId, req.params.id);
      return res.json({ data: { submitted: true } });
    } catch (error) {
      return next(error);
    }
  };

  listSubmittedCvs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listSubmittedCvs();
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  listTeachers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listTeachers();
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  listConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.query.role as "student" | "teacher";
      const data = await this.service.listConversations(req.query.userId, role);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createConversation(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteConversation(req.query.userId, req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  listChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listChatMessages(req.query.userId, req.params.conversationId);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  };

  sendChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.sendChatMessage(req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  };
}
