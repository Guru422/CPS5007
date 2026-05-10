import { Request, Response } from "express";

export class HealthController {
  getHealth(_req: Request, res: Response) {
    return res.json({ ok: true });
  }
}
