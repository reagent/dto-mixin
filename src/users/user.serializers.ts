import { User as UserEntity } from './user.entity';

type User = Pick<UserEntity, 'id' | 'name' | 'createdAt' | 'updatedAt'>;

export type UserShow = User;
