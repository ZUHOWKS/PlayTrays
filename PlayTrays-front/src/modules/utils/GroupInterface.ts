import type {FriendInterface} from "@/modules/utils/UserInterface";

export interface GroupInterface {
    group: number;
    leader: number;
    players: FriendInterface[];
}