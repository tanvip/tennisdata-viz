var treedata = []
var matchesByYear = {

}
var matchListObj = {
   //"year" : ["A vs B"]
}
/*var treeObj = {
   key: "Service: \n Ace: 55 \n First Serve: 55\n Fast Serve: 55 \n",
   year: "2012",
   matchlist: "Southern Asia",
   value: 25500100
} */
var playerCards = {
  // "name":{playerTotal}
}
/*
var playerTotal = {
  totalServe : 0,
  totalReturn : 0,
  totalMatches : 0,
  totalPerformance : 0
} */

function createPlayerCards() {
   // adds 4 serve matrics plus average of aces - average of doubles
   for(var i=0; i < data.length; i++) {
     //winner
      var str1 = data[i].firstServe1.substring(0, data[i].firstServe1.length - 1);
      var serviceTotal1 = Number(data[i].avgFirstServe1) + Number(data[i].ace1) - Number(data[i].double1) +
      Number(data[i].avgSecServe1) + Number(str1) + Number(data[i].fastServe1);
      var break1 = Number(data[i].break1.substring(0, data[i].break1.length - 1)),
          net1 = Number(data[i].net1.substring(0, data[i].net1.length - 1)),
          firstPtWon1 = Number(data[i].firstPointWon1.substring(0, data[i].firstPointWon1.length - 1)),
          secondPtWon1 = Number(data[i].secPointWon1.substring(0, data[i].secPointWon1.length - 1)),
          returnTotal1 = Number(data[i].return1.substring(0, data[i].return1.length - 1)),
          tBreak1 = Number(data[i].break1.substring(0, data[i].break1.length - 1)),
          tFPtWon1 = Number(data[i].firstPointWon1.substring(0, data[i].firstPointWon1.length - 1)),
          tScPtWon1 = Number(data[i].secPointWon1.substring(0, data[i].secPointWon1.length - 1)),
          tTop1 = Number(data[i].total1),
          tWinner1 = Number(data[i].winner1),
          tError1 = Number(data[i].error1),
          performanceTotal1 = firstPtWon1 + secondPtWon1 +
                             break1 + returnTotal1 + data[i].total1 -
                             Number(data[i].error1) + Number(data[i].winner1) + net1;

      // update playerCards
      var player = data[i].player1;
      if(playerCards[player]) {
         playerCards[player].totalServe = playerCards[player].totalServe + serviceTotal1;
         playerCards[player].totalReturn = playerCards[player].totalReturn + returnTotal1;
         playerCards[player].totalMatches = playerCards[player].totalMatches + 1;
         playerCards[player].totalPerformance = playerCards[player].totalPerformance + performanceTotal1,
         playerCards[player].tbreak = playerCards[player].tbreak + tBreak1;
         playerCards[player].tFirstPtWon = playerCards[player].tFirstPtWon + tFPtWon1;
         playerCards[player].tSecondPtWon = playerCards[player].tSecondPtWon + tScPtWon1;
         playerCards[player].tTotal = playerCards[player].tTotal + tTop1;
         playerCards[player].tWinner = playerCards[player].tWinner + tWinner1;
         playerCards[player].tError = playerCards[player].tError + tError1;
      } else {
        playerCards[player] = {
          totalServe : serviceTotal1,
          totalReturn : returnTotal1,
          totalMatches : 1,
          totalPerformance : performanceTotal1,
          tbreak: tBreak1,
          tFirstPtWon: tFPtWon1,
          tSecondPtWon: tScPtWon1,
          tTotal: tTop1,
          tWinner: tWinner1,
          tError: tError1
        }
      }

      // loser
      var str2 = data[i].firstServe2.substring(0, data[i].firstServe2.length - 1);
      var serviceTotal2 = Number(data[i].avgFirstServe2) + Number(data[i].ace2) - Number(data[i].double2) +
      Number(data[i].avgSecServe2) + Number(str2) + Number(data[i].fastServe2);
      var break2 = Number(data[i].break2.substring(0, data[i].break2.length - 1)),
          net2 = Number(data[i].net2.substring(0, data[i].net2.length - 1)),
          firstPtWon2 = Number(data[i].firstPointWon2.substring(0, data[i].firstPointWon2.length - 1)),
          secondPtWon2 = Number(data[i].secPointWon2.substring(0, data[i].secPointWon2.length - 1)),
          returnTotal2 = Number(data[i].return2.substring(0, data[i].return2.length - 1)),
          tBreak2 = Number(data[i].break2.substring(0, data[i].break2.length - 1)),
          tFPtWon2 = Number(data[i].firstPointWon2.substring(0, data[i].firstPointWon2.length - 1)),
          tScPtWon2 = Number(data[i].secPointWon2.substring(0, data[i].secPointWon2.length - 1)),
          tTop2 = Number(data[i].total2),
          tWinner2 = Number(data[i].winner2),
          tError2 = Number(data[i].error2),
          performanceTotal2 = firstPtWon2 + secondPtWon2 +
                             break2 + returnTotal2 + data[i].total2 -
                             Number(data[i].error2) + Number(data[i].winner2) + net2;
      // update playerCards
      player = data[i].player2;
      if(playerCards[player]) {
         playerCards[player].totalServe = playerCards[player].totalServe + serviceTotal2;
         playerCards[player].totalReturn = playerCards[player].totalReturn + returnTotal2;
         playerCards[player].totalMatches = playerCards[player].totalMatches + 1;
         playerCards[player].totalPerformance = playerCards[player].totalPerformance + performanceTotal2;
         playerCards[player].tbreak = playerCards[player].tbreak + tBreak2;
         playerCards[player].tFirstPtWon = playerCards[player].tFirstPtWon + tFPtWon2;
         playerCards[player].tSecondPtWon = playerCards[player].tSecondPtWon + tScPtWon2;
         playerCards[player].tTotal = playerCards[player].tTotal + tTop2;
         playerCards[player].tWinner = playerCards[player].tWinner + tWinner2;
         playerCards[player].tError = playerCards[player].tError + tError2;
      } else {
        playerCards[player] = {
          totalServe : serviceTotal2,
          totalReturn : returnTotal2,
          totalMatches : 1,
          totalPerformance : performanceTotal2,
          tbreak: tBreak2,
          tFirstPtWon: tFPtWon2,
          tSecondPtWon: tScPtWon2,
          tTotal: tTop2,
          tWinner: tWinner2,
          tError: tError2
        }
      }

      // creating treedata
      if(data[i].player1 == "Novak Djokovic" || data[i].player2 == "Novak Djokovic" ) {
         var num = data[i].player1 == "Novak Djokovic" ? 1 : 2;
         var key = data[i]["player" + num] + " won the match.";
         /*var key = "Highlights: \n  + "\n Winner: " + data[i]["winner" + num]
                    +" \n Net: " + data[i]["net" + num] + " First Point Won: " + data[i]["firstPointWon" + num] +
                   "\n Second Point Won " + data[i]["secPointWon" + num] +
                   "\n Break: " + data[i]["break" + num] + "\n Error: " + + data[i]["error" + num];*/
         var matchStr = "\n"+ data[i].player1 + " vs " + data[i].player2;
         var treeObj = {
           key: key,
           year: data[i].year,
           matchlist: matchStr,
           value: 1
         };
         treedata.push(treeObj);

         // creating Match List
        /* if(!matchListObj[data[i].year]) {
           matchListObj[data[i].year] = [];
         }

         matchListObj[data[i].year].push(matchStr); */
      }
   }
   console.log(treedata);
   /*for(var x = 0; x < treedata.length; x++) {
     treedata[x].matchlist = matchListObj[treedata[x].year];
   }*/
}

createPlayerCards();
