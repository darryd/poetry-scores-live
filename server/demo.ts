import { clubModel } from "./model/club";
import { competitionModel } from "./model/competition";


export async function upsertDemo() {

    try {

    var demoClub = await clubModel.findOneAndUpdate({name: 'demo'}, {title: 'Try me: Demo'}, { new: true, upsert: true }) 
    var demoCompetition = await competitionModel.findOneAndUpdate({title: 'Demo'}, {club: demoClub._id}, {new: true, upsert: true})

    console.log('Demo')
    console.log(demoClub)
    console.log(demoCompetition)



    } catch(error) {
        console.error(error)
    }
    

}

export async function getDemoCompetition() {
    var demoClub = await clubModel.findOne({name: 'demo'})
    if (demoClub) {
        return competitionModel.findOne({club: demoClub._id})
    }
    else {
        console.error('demoClub is null.')
    }
}