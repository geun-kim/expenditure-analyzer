import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.setGlobalPrefix("api");

  app.useStaticAssets(join(__dirname, "../public"));
  app.use((req: Request, res: Response, next) => {
    if (req.url.startsWith("/api")) {
      return next();
    }
    res.sendFile(join(__dirname, "../public/index.html"));
  });

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
}
bootstrap();
