import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CategoryKeywords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column("text")
  keywords: string;

  @Column()
  userId: string;
}
