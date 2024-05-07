export interface UserInterface {
    id: number;
    username: string;
    points: number;
    updatedAt: string;
    createdAt: string;
}

export interface FriendInterface {
  id: number
  username: string
  online: boolean
  status: string
}
