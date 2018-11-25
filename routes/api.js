const Event = require(__rootdir + "/db_models/Event");
const router = require("express").Router();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

router.get("/", (req, res) => {
  res.status(200).send(
    `Available API:<br/>
    GET - /api/events<br/>
    GET - /api/events:id<br/>
    POST - /api/events<br/>
    PUT - /api/events/:id<br/>
    DELETE - /api/events/:id<br/>
    <br/>
    GET - /api/members<br/>
    GET - /api/members/pendings<br/>
    PUT - /api/members/pendings/:id`
  );
});

router.get("/private", ensureLoggedIn("/auth/login"), (req, res) => {
  res.status(200).send("this is a private area...");
});

router.get("/events", (req, res) => {
  Event.find().then(events => {
    res.send(events);
  });
});

router.get("/events/:id", (req, res) => {
  const { id } = req.params;

  Event.findById(id).then(events => {
    res.send(events);
  });
});

router.post("/events", (req, res) => {
  const { date, venue, memberId } = req.body;

  new Event({
    date: date,
    venue: venue,
    created_by: memberId,
    payer: memberId,
    bill_amount: 0
  })
    .save()
    .then(newEvent => {
      res.send(newEvent);
    });
});

router.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { memberId, billAmount } = req.body;

  Event.findByIdAndUpdate(
    id,
    { payer: memberId, bill_amount: billAmount },
    { new: true, runValidation: true }
  ).then(updatedEvent => res.send(updatedEvent));
});

router.delete("/events/:id", (req, res) => {
  const { id } = req.params;

  Event.findByIdAndRemove(id).then(updatedEvent => res.send(updatedEvent));
});

module.exports = router;
