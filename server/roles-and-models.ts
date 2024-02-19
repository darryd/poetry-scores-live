import { Model, Document } from "mongoose";
import { AdminDoc, AdminModel } from "./model/admin";
import { ClubDoc, clubModel } from "./model/club";
import { CompetitionDoc, competitionModel } from "./model/competition";
import { PerformanceDoc, performanceModel } from "./model/performance";
import { RoundDoc, roundModel } from "./model/round";
import { ScoreDoc, scoreModel } from "./model/score";
import { ScorekeeperDoc, ScorekeeperModel } from "./model/scorekeeper";
import { SignupDoc, SignupModel } from "./model/signup";

export const Score = 'Score'
export const Performance = 'Performance'
export const Round = 'Round'
export const Signup = 'Signup'
export const Competition = 'Competition'
export const Club = 'Club'
export const Scorekeeper = 'Scorekeeper'
export const Admin = 'Admin'

export type Role = 'scorekeeper' | 'admin' | 'owner'
export type Models = ScoreDoc | PerformanceDoc | RoundDoc | SignupDoc | CompetitionDoc | ClubDoc | ScorekeeperDoc | AdminDoc;

export var modelNames:{[key: string]: any} = { 
                [Score]: scoreModel,
                [Performance]: performanceModel,
                [Round]: roundModel,
                [Signup]: SignupModel,
                [Competition]: competitionModel,
                [Club]: clubModel,
                [Scorekeeper]: ScorekeeperModel,
                [Admin]: AdminModel
             }

export var accessToModel: {[key: string]: Role[]} ={
    [Score]: ['scorekeeper', 'admin', 'owner'],
    [Performance]: ['scorekeeper', 'admin', 'owner'],
    [Round]: ['scorekeeper', 'admin', 'owner'],
    [Signup]: ['scorekeeper', 'admin', 'owner'],
    [Competition]: ['scorekeeper', 'admin', 'owner'],
    [Club]: ['admin', 'owner'],
    [Scorekeeper]: ['admin', 'owner'],
    [Admin]: ['owner']
}

export var restrictedAccessToModel: {[key: string]: Role[]} = {
    [Competition]: ['admin', 'owner'],
    [Club]: ['owner']
}