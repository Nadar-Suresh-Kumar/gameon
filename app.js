require('dotenv').config()

const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session');

// const hbs = require("hbs")
const LogInCollection = require("./mongo")
const port = process.env.PORT || 3000
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, './tempelates')
const publicPath = path.join(__dirname, './public')
//const publicPath = __dirname;

console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
//app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(publicPath))


const distPath = path.join(__dirname, 'src');


app.use(session({
    secret: 'sk10', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true
}));



// hbs.registerPartials(partialPath)


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/games', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.get('/word', (req, res) => {
    res.sendFile(path.join( distPath,'word.html'));
 });
 app.get('/img', (req, res) => {
    res.sendFile(path.join(distPath, 'imgpuzzle.html'));
 });
 app.get('/menj', (req, res) => {
    res.sendFile(path.join(distPath, 'menja.html'));
 });
 app.get('/bubb', (req, res) => {
    res.sendFile(path.join(distPath, 'bubble.html'));
 });
 app.get('/tic', (req, res) => {
    res.sendFile(path.join(distPath, 'tic.html'));
 });
 app.get('/stick', (req, res) => {
    res.sendFile(path.join(distPath, 'stick.html'));
 });



// app.get('/home', (req, res) => {
//     res.render('home')
// })
const dataStore = [];
let n;

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password,
        
     
    };
   // dataStore.push(data);*/
    try {
        const checking = await LogInCollection.findOne({ name: req.body.name });

        if (checking) {
            if (checking.password === req.body.password) {
                return res.send("User details already exist");
            } else {
                // Handle the case where the user name exists but the password is different
                return res.send("User name already exists with a different password");
            }
        } else {
            console.log(dataStore);
            await LogInCollection.insertMany([data]);
            return res.status(201).render("home", {
                naming: req.body.name
            });
        }
    } catch (error) {
        return res.send("Wrong inputs");
    }
});



app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });
        const data = {
            name: req.body.name,
            password: req.body.password,
        };
        n=data.name;
        console.log(n);
        dataStore.push(data);
        req.session.user = { username: req.body.name };

        if (!check) {
            return res.send("User not found");
        }

        if (check.password === req.body.password) {
            return res.redirect('/games');
        } else {
            return res.send("Incorrect password");
        }
    } catch (e) {
        return res.send("Error occurred: wrong details");
    }
});

app.post('/data', async (req, res) => {
    //const playerName=n;
    //console.log(playerName);
    const playerName = req.session.user.username;

    const score = req.body.score;
    
    try {
        // Find the player's document based on their name
        const player = await LogInCollection.findOne({ name: playerName });

        if (!player) {
            return res.status(404).json({ error: 'word Player not found' });
        }
        console.log(score)
        // Update the player's score
        player.scored = score;
        

        // Save the updated player document
        await player.save();
        dataStore.pop();
        res.status(200).json({ message: 'word Score updated successfully' });
    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({ error: 'word Could not update score' });
    }
});
app.post('/datas', async (req, res) => {
    const playerName = req.session.user.username;
    const newScore = req.body.scores;

    try {
        // Find the player's document based on their name
        const player = await LogInCollection.findOne({ name: playerName });

        if (!player) {
            return res.status(404).json({ error: 'stick Player not found' });
        }
        if(player.scores === undefined) {
            player.scores=0;
            console.log(player.scores);
            player.save();
          }

        // Log the current and new scores for debugging
        console.log(player.scores);


        // Compare the new score with the current score
        if (newScore > player.scores) {
            // Update the player's score if the new score is higher
            player.scores = newScore;
            

            // Save the updated player document
            await player.save();

            console.log('Score updated to:', newScore);
            res.status(200).json({ message: 'stick Score updated successfully' });
        } else {
            console.log('stick New score is not higher. No update made.');
            res.status(200).json({ message: ' stick New score is not higher than the current score. No update made.' });
        }

        // Remove the last item from dataStore
       // dataStore.pop();

    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({ error: 'Could not update score' });
    }
});

app.post('/datago', async (req, res) => {
    const playerName = req.session.user.username;

    let data = req.body;

    try {
        const player = await LogInCollection.findOne({ name: playerName });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        player.computer = data.computer;
        player.ties = data.ties;
        player.player = data.player;

        await player.save();

        res.status(200).json({ message: 'Score updated successfully' });
    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({ error: 'Could not update score' });
    }
});



app.listen(port, () => {
    console.log('port connected');
})
