const puppeteer = require('puppeteer');

var url = process.env.MONGODB_URI;
const db = require('monk')(url);

function getOrderValue() {
    return Number(Date.now()) * 1000
}

function getNegativeOrderValue() {
    return -1 * getOrderValue()
}

const imported_clubName = 'verses'

async function getIdForClub() {

    const clubs = db.get('clubs')

    var result = await clubs.find({name: imported_clubName})
    console.log(result)
    
    return result[0]._id
};


async function createCompetition(club, title, imported_id, createdAt, updatedAt) {

    var order = getNegativeOrderValue()
    const competitions = db.get('competitions')

    var competition = { 
                        club, 
                        title, 
                        order, 
                        createdAt: createdAt, 
                        updatedAt: updatedAt, 
                        imported: true,
                        imported_clubName,
                        imported_id
                    }

    return competitions.insert(competition)
};

(async function () {

    var vanslam_id = await getIdForClub()
    var competitions = db.get('competitions')

    var results = await competitions.update({_id: "6133a10cd78cf0493b299ef0"},
                                            {$set: { "club" : vanslam_id}})

    console.log(results)
})//()


/*
    order: Type.number({default: getOrderValue}),
    competition: Type.objectId({ref: 'Competition'}),
    [title]: Type.string(),
    [numJudges]: Type.number({default: 5, required: true, max: 10}),
    [removeMinAndMaxScores]: Type.boolean(),
    [isCumulative]: Type.boolean(),
    [previousRound]: Type.objectId({ref: 'Round'}),
    [incomingRank]: Type.number(),
    [timeLimit]: Type.number(),
    [grace]: Type.number()


    are_poets_from_previous: false
    competition_id: 231
    created_at: "2018-10-29T18:40:22.021-07:00"
    grace_period: 10
    id: 772
    is_cumulative: null
    num_places: null
    previous_round_number: null
    round_number: 1
    time_limit: 180
    title: "Sacrificial Round"
    updated_at: "2018-10-29T18:40:22.021-07:00"

*/

function getPreviousRoundId(round) {


    if (round) {
        return round._id
    }

    return null
}

function getIncomingRank(round) {

    if (round) {
        return round.imported_num_places
    }

    return null;
}

async function getPreviousRound(round) {

    var rounds = db.get('rounds')

    if (round.is_cumulative) debugger


    if (round.previous_round_number) {

        var query = { 
                        imported_competition_id: round.competition_id,
                        imported_round_number: round.previous_round_number
                    }

        
        var previous_array = await rounds.find(query)

        if (previous_array.length > 0) {
            return previous_array[0]
        }

    }

    return null
}

async function createRound(slam, round) {

    var competitions = db.get('competitions')
    var rounds = db.get('rounds')

    if (round.is_cumulative) debugger

    var previous = await getPreviousRound(round)
    console.log('previous round', previous)

    var query = {imported_id: round.competition_id}
    console.log('query', query)

    var competition_array = await competitions.find(query)
    var competition = competition_array[0]

    console.log('round', round)
    console.log('competition', competition)

    var newRound = {
        competition: competition._id,
        order: getOrderValue(),
        title: round.title,
        numJudges: slam.num_judges,
        removeMinAndMaxScores: slam.do_not_include_min_and_max_scores,
        isCumulative: round.is_cumulative,
        previousRound: await getPreviousRoundId(previous),
        incomingRank: await getIncomingRank(previous),
        timeLimit: round.time_limit,
        grace: round.grace_period,
        createdAt: round.created_at,
        updatedAt: round.updated_at,
        // imported data:
        imported: true,
        imported_clubName,
        imported_id: round.id,
        imported_competition_id: round.competition_id,
        imported_round_number: round.round_number,
        imported_num_places: round.num_places
    }


    return rounds.insert(newRound)
}


async function createPerformance(round_id, poet, seconds, penalty) {

    /* 
    order: Type.number({required: true, default: getOrderValue}),
    [poet]: Type.string(),
    [minutes]: Type.number(),
    [seconds]: Type.number({type: Number, min: 0, max: 59}),
    [penalty]: Type.number(),
    round: Type.objectId({ref: 'Round'})
    */

    var newPerformance = {
        order: getOrderValue(),
        poet,
        minutes: Math.floor(seconds / 60),
        seconds: seconds % 60,
        penalty,
        round: round_id,
        imported: true,
        imported_clubName
    }

    var performances = db.get('performances')
    return performances.insert(newPerformance)
}

async function createScore(performance_id, score) {
    /* 

    performance: Type.objectId({ref: 'Performance'}),
    order: Type.number({required: true, default: getOrderValue}),
    score: Type.number()

    */
   var newScore = {
       performance: performance_id,
       order: getOrderValue(),
       score,
       imported: true,
       imported_clubName
   }

   var scores = db.get('scores')
   return scores.insert(newScore);
};

async function removeImportedData() {

    var competitions = db.get('competitions')
    var rounds = db.get('rounds')
    var performances = db.get('performances')
    var scores = db.get('scores')
    await competitions.remove({imported: true, imported_clubName })
    await rounds.remove({imported: true, imported_clubName})
    await performances.remove({imported: true, imported_clubName})
    await scores.remove({imported: true, imported_clubName})
}




(async function () {

    await removeImportedData()

    let launchOptions = { headless: !false, args: ['--start-maximized'] };
    var vanslam_id = await getIdForClub()
    console.log('vanslam_id', vanslam_id)

    // launch the browser with above options
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // set viewport and user agent (just in case for nice viewing)
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    // go to website that protected with HTTP Basic Authentication
    await page.goto('http://0.0.0.0:3000');

    try {
        var links = await page.evaluate(() => {

            var links = Array.from(document.getElementsByTagName('a'))

            return links.map(a => a.href)
        })

        for (var i =0; i<links.length; i++) {
            var link = links[i]
            await page.goto(link)

            var slam = await page.evaluate(async () => {

                const roundImportedFields = [
                    'are_poets_from_previous',
                    'competition_id',
                    'created_at',
                    'grace_period',
                    'id',
                    'is_cumulative',
                    'num_places',
                    'previous_round_number',
                    'round_number',
                    'time_limit',
                    'title',
                    'updated_at'
                ]
                function getPerformance(p) {
                    return {
                        poet: p.poet.name,
                        judges: p.judges,
                        seconds: p.seconds,
                        penalty: p.penalty
                    }
                }

                function getPerformances(performances) {
                    return performances.map(p => getPerformance(p))
                }

                function getRound(round) {

                    var result = {}

                    roundImportedFields.forEach(field => result[field] = round[field])
                    result['performances'] = getPerformances(round.round_js.performances)

                    return result
                }
                var title = slam.title

                return {
                    slam,
                    title,
                    imported_id: slam.id,
                    createdAt: slam.created_at,
                    updatedAt: slam.updated_at,
                    rounds: rounds.map(r => getRound(r))
                }
            })

            await createCompetition(vanslam_id, slam.title, slam.imported_id, slam.createdAt, slam.updatedAt)
            console.log(slam.slam)

            for (var j=0; j<slam.rounds.length; j++) {
                var round = slam.rounds[j]
                var newRound = await createRound(slam.slam, round)

                console.log('newRound', newRound)
                for (var k=0; k<round.performances.length; k++) {
                    var performance = round.performances[k]

                    var poet = performance.poet
                    var seconds = performance.seconds
                    var penalty = performance.penalty

                    var newP = await createPerformance(newRound._id, poet, seconds, penalty)
                    console.log('newP', newP)

                    for (var l=0; l<performance.judges.length;l++) {

                        
                        var judge = performance.judges[l]
                        var newScore = await createScore(newP._id, judge)
                        console.log('newScore', newScore)
                    }
                }
            }

            //await browser.close()

        }

    } catch (error) {
        console.log(error)
    }


})//()