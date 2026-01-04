const dialogflow = require("@google-cloud/dialogflow");
const { WebhookClient, Payload, Button } = require("dialogflow-fulfillment");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/webhook", async (req, res) => {
  var id = res.req.body.session.substr(43);
  console.log(id);
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log(`intent  =>  hi`);
    agent.add(
      "Hi I am the AI assistant of dialogflow, You can also connect with human directly"
    );
  }

  async function booking(agent) {
    const { destination, departure, date, number, email, phone } = agent.parameters;

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          destination: destination,
          departure: departure,
          travel_date: date,
          number_of_people: number,
          email: email,
          phone: phone
        },
      ]);

    if (error) {
      console.error('Error inserting into Supabase:', error);
    } else {
      console.log('Successfully saved to Supabase:', data);
    }

    agent.add(
      `Hi there, Your booking has been registered for ${destination} from ${departure} on ${date} for ${number} person. We sent you email at ${email} and sent a message on your number ${phone}`
    );

    console.log("Number of People", number);
    console.log("User Email", email);
    console.log("User Phone Number:", phone);
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", hi);
  intentMap.set("reservation", booking);
  agent.handleRequest(intentMap);
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
