import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ default: 'free' })
  scenario: string;

  /** Duration in seconds */
  @Column({ default: 0 })
  duration: number;

  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  @Column({ type: 'float', nullable: true })
  fluencyScore: number | null;

  @Column({ type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ type: 'float', nullable: true })
  pronunciationScore: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
