import { postgresService } from "../../infrastructure/database/postgres.service";
import { AiCvGeneratorService } from "./ai-cv-generator.service";
import { StudentController } from "./student.controller";
import { StudentRepository } from "./student.repository";
import { createStudentRouter } from "./student.routes";
import { StudentService } from "./student.service";

const repository = new StudentRepository(postgresService);
const aiCvGeneratorService = new AiCvGeneratorService();
const service = new StudentService(repository, aiCvGeneratorService);
const controller = new StudentController(service);
const router = createStudentRouter(controller);

export const studentModule = {
  basePath: "/bff/student",
  router,
};
