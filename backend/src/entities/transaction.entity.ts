import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountType: string;

  @Column()
  accountNumber: string;

  @Column()
  transactionDate: string;

  @Column({ nullable: true })
  chequeNumber: string;

  @Column()
  description1: string;

  @Column()
  description2: string;

  @Column({ default: "Uncategorized" })
  category: string;

  @Column("decimal", { precision: 10, scale: 2 })
  cad: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  usd: number;

  @Column()
  userId: string;
}
