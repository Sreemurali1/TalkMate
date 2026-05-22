import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 0 })
  streak: number;

  @Column({ default: 0 })
  totalSessions: number;

  @Column({ default: 0 })
  totalMinutes: number;

  /** Date of the last completed session — used for streak calculation */
  @Column({ type: 'date', nullable: true })
  lastSessionDate: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
