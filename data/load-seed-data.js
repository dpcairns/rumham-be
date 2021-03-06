/* eslint-disable no-console */
const client = require('../lib/client');
// import our seed data:
const recipes = require('./recipes.js');
const events = require('./events.js');
const usersData = require('./users.js');
const userEvents = require('./user-events.js');
const userRecipes = require('./user-recipes.js');
const eventRecipes = require('./event-recipes.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (display_name, email, hash)
                      VALUES ($1, $2, $3)
                      RETURNING *;
                  `,
        [user.display_name, user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      recipes.map(recipe => {
        return client.query(`
                    INSERT INTO recipes (title, food_api_id, image_url, note, completed, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [recipe.title, recipe.food_api_id, recipe.image_url, recipe.note, recipe.completed, user.id]);
      })
    );
    

    await Promise.all(
      events.map(event => {
        return client.query(`
                    INSERT INTO events (title, date, owner_id)
                    VALUES ($1, $2, $3);
                `,
        [event.title, event.date, event.owner_id]);
      })
    );

    await Promise.all(
      userEvents.map(userEvent => {
        return client.query(`
                    INSERT INTO user_events (user_id, event_id)
                    VALUES ($1, $2);
                `,
        [userEvent.user_id, userEvent.event_id]);
      })
    );

    await Promise.all(
      userRecipes.map(userRecipe => {
        return client.query(`
                    INSERT INTO user_recipes (user_id, recipe_id)
                    VALUES ($1, $2);
                `,
        [userRecipe.user_id, userRecipe.recipe_id]);
      })
    );

    await Promise.all(
      eventRecipes.map(eventRecipe => {
        return client.query(`
                    INSERT INTO event_recipes (event_id, recipe_id)
                    VALUES ($1, $2);
                `,
        [eventRecipe.event_id, eventRecipe.recipe_id]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
