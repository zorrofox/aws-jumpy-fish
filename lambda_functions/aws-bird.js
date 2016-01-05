var aws = require('aws-sdk');
aws.config.region = 'ap-northeast-1';
exports.handler = function(event, context) {
  switch (event.action) {
    case 'newscore':
      newScore(event, context)
      break;
    default:
      getHighscores(event,context);
  }
}

function newScore(event, context) {
  var db = new aws.DynamoDB();
  var params = {
    Item: {
      uuid: {
        S: context.invokeid
      },
      date: {
        S: new Date().toISOString()
      },
      score: {
        N: event.score.toString()
      },
      player: {
        S: event.player
      },
      game: {
        S: "aws-bird"
      },
    },
    TableName: 'aws-bird-highscore'
  }
  db.putItem(params, function(err, data) {
    if (err) context.fail(err);
    else context.succeed();
  });
}

function getHighscores(event, context) {
  var db = new aws.DynamoDB();
    var params = {
        TableName: 'aws-bird-highscore',
        KeyConditionExpression: 'game = :t1',
        IndexName: 'game-score-index',
        ExpressionAttributeValues: {
            ":t1": {"S": 'aws-bird'}
        },
        Limit: '10',
        ScanIndexForward: false

    }
    db.query(params, function(err, data) {
        if (err) context.fail(err);
        else {
            var scores = [];
            for (var i = 0 ; i < data.Items.length ; i++) {
                var item = data.Items[i];
                scores.push({
                    player: item.player.S,
                    score: item.score.N
                });
            }
            context.succeed(scores);
        }
    });
}
