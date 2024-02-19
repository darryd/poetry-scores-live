/*

syncing on Rounds.....
    |
    +--------->  performances......
			|
			+-------------------> scores


     performance/round/:_id
     
     
     scores/performance/:_id
     
     
     when we get a round, we say, follow performance/round/:_id, that gives
     us a bunch of performances 
     
     
     with each performance we say, follow scores/performance/:_id
     
     
     chain('/round/_id', ['performance/round/:_id', 'scores/performance/:_id])
     
     */

var round = {_id: 3}

var performances = [
                      {_id: 2, round: 3},
                      {_id: 3, round: 3},
                      {_id: 4, round: 3},
                      {_id: 5, round: 3},
                      {_id: 6, round: 3},
                      {_id: 7, round: 3},
                   ]

scores = [
    {_id: 1, performance: 2},
    {_id: 2, performance: 2},
    {_id: 3, performance: 3},
    {_id: 4, performance: 3},
    {_id: 5, performance: 4},
    {_id: 6, performance: 4},
    {_id: 7, performance: 5},
    {_id: 8, performance: 5},
    {_id: 9, performance: 6},
]

/* the server can tell the client what the relationships are
 *
 * for instance, Round has child performances...
 *
 * api GET /notification/Round ===> [{model: 'Performance', url: '/performance/round/:_id'}]
 *
 * follow up by GET /notification/Performance ==> [{model: 'Score', url: '/score/performance/:_id'}]
 *
 */
