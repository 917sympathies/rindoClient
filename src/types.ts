// export interface IProject {
//     id: string,
//     name: string,
//     description: string,
//     inviteLink: string,
//     chat: {} | null,
//     stages: [] | null,
//     tasks: [] | null,
//     users: [] | null,
//     startDate: string,
//     finishDate: string
// }
  
export interface IUser {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    projects: IProject[]
}

export interface IUserInfo {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
}

export interface IMessage {
    senderId: string,
    chatId: string,
    content: string,
    username: string
}

export interface IChat {
    id: string,
    projectId: string,
    messages: IMessage[]
}

export interface ITask {
    id: string,
    name: string,
    description: string,
    projectId: string,
    stageId: string,
    index: number,
    responsibleUserId: string | null,
    comments: ITaskComment[] | null,
    startDate: string | null,
    finishDate: string | null
}

export interface ITaskComment{
    id: string,
    content: string,
    username: string,
    taskId: string,
    userId: string,
    time: string
}

export interface IRole {
    id: string,
    name: string,
    canAddRoles: boolean,
    canAddStage: boolean,
    canAddTask: boolean,
    canCompleteTask: boolean,
    canDeleteStage: boolean,
    canDeleteTask: boolean,
    canExcludeUser: boolean,
    canInviteUser: boolean,
    canModifyRoles: boolean,
    canModifyStage: boolean,
    canModifyTask: boolean,
    canUseChat: boolean,
}

export interface IUserRights{
    canAddTask: boolean,
    canUseChat: boolean,
    canAddStage: boolean,
    canDeleteStage: boolean,
    canDeleteTask: boolean,
  }

export interface IStage {
    id: string,
    name: string,
    projectId: string,
    tasks: ITask[]
}

export interface IProject{
    id: string,
    name: string,
    description: string,
    chat: IChat,
    chatId: string,
    inviteLink: string,
    startDate: string,
    finishDate: string,
    ownerId: string,
    // owner: IUserInfo,
    owner: IUser,
    users: IUser[],
    // tasks: ITask[],
    stages: IStage[],
    roles: IRole[]
}

export interface ICookieInfo {
    userId : string,
    exp: number
}

export interface IStageDto{
    name: string,
    projectId: string
}

export interface IProjectSettings{
    name: string,
    description: string,
    inviteLink: string,
    users: IUserInfo[],
    roles: IRole[] | null,
    startDate: string,
    finishDate: string
}