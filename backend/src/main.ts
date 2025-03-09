import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { Request, Response } from "express";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  });

  app.setGlobalPrefix("api");

  const frontendPath = join(__dirname, "../frontend/browser");
  app.useStaticAssets(frontendPath);
  app.use(express.static(frontendPath));

  app.use((req: Request, res: Response, next) => {
    if (req.url.startsWith("/api")) {
      return next();
    }
    res.sendFile(join(frontendPath, "index.html"));
  });

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
}
bootstrap();
