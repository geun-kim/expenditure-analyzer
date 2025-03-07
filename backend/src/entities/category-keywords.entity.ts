import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CategoryKeywords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  category: string;

  @Column("text")
  keywords: string;

  @Column()
  userId: string;
}
