const Event = require(__rootdir + "/db_models/Event");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const Member = require(__rootdir + "/db_models/Member");
const router = require("express").Router();

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

/*----------------Events----------------*/
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

/*----------------Events----------------*/
router.get("/members", (req, res) => {
  Member.find().then(members => {
    res.send(members);
  });
});

router.get("/members/pendings", (req, res) => {
  Member.find()
    .where({ allowed_operation: [] })
    .then(members => {
      res.send(members);
    });
});

router.put("/members/pendings/:id", async (req, res) => {
  const { id } = req.params;
  const { allowedOperations } = req.body;

  const member = await Member.findById(id);

  if (!member) return res.sendStatus(404);

  member.allowed_operation = allowedOperations;

  const savedMember = await member.save();

  res.send(savedMember);
});

module.exports = router;
