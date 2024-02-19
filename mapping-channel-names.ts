/*


  club/
  club/:name


  club        watches club (all)
  club/:id    watches club (:id)


 competitions

  channels: 
 
    
    +-------------+-------------+------------------------------+
    |  Observer   | Observed    | Channel Name                 |
    +-------------+-------------+------------------------------+
    | competition | competition | competition                  |
    +-------------+-------------+------------------------------+
    | competition | competition | competition/:_id             |
    +-------------+-------------+------------------------------+
    | club        | competition | competition/club/:name       |
    +-------------+-------------+------------------------------+
    | scorekeeper | competition | competition/scorekeeper/:_id |
    +-------------+-------------+------------------------------+

    / seperates words words can be one of observer, observed, or variable

    first to appear is the observer, if an observed doesn't appear in the channelName, then the 
    observer is also the observed. if the variable appears, seems to belong to the observed

    / seperates the observer from the observed and : indicates a variable
    the first 

    new competition how do we find the channels.


    
          competition-------> 


                          

  competition --update ---> what channels are listening?
                              let's look: okay...Ummm. -------> 

[ exact id ] [ any id ] [ if competition belongs to me ] 

observer observed

*/

function parseChannelName(channelName: string) {

}

