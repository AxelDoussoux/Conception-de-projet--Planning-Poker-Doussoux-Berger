export interface Task {
    id:string
    sessionId?: string // clé étrangère de l'id de la session
    title:string 
}