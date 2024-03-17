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

interface IMessage {
    senderId: string,
    chatId: string
}

interface IChat {
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
}

export interface IRole {

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

export interface CookieInfo {
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