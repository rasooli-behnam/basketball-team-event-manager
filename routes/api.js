const Event = require(__rootdir + "/db_models/Event");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const Member = require(__rootdir + "/db_models/Member");
const router = require("express").Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.status(200).send(
    `Available API:<br/>
    POST - /api/login
    <br/>
    GET - /api/events<br/>
    GET - /api/events:id<br/>
    POST - /api/events<br/>
    PUT - /api/events/:id<br/>
    DELETE - /api/events/:id<br/>
    <br/>
    GET - /api/members<br/>
    PUT - /api/members/:id`
  );
});

router.post("/login", (req, res) => {
  verifyTokenId(req.header("x-auth-token"))
    .then(result => {
      if (result.existingUser) res.status(200).send("user already exist");
      else {
        new Member({
          googleId: result.user.id,
          name: result.user.displayName,
          allowed_operation: []
        })
          .save()
          .then(newUser => {
            res.status(200).send("new user registered");
          });
      }
    })
    .catch(error => {
      if (error) res.sendStatus(error.status);
    });
});

/*----------------Events----------------*/
router.get("/events", ensureAuthorisedUser, (req, res) => {
  if (!req.user.allowed_operation.includes("read")) return res.send([]);

  Event.find()
    .populate("created_by", "name -_id")
    .populate("payer", "name -_id")
    .then(events => {
      res.send(events);
    });
});

router.get("/events/:id", ensureAuthorisedUser, (req, res) => {
  const { id } = req.params;

  Event.findById(id).then(events => {
    res.send(events);
  });
});

router.post("/events", ensureAuthorisedUser, (req, res) => {
  if (!req.user.allowed_operation.includes("create"))
    return res.sendStatus(400);

  const { user } = req;
  const { date, venue } = req.body;

  new Event({
    date: date,
    venue: venue,
    created_by: user.id
  })
    .save()
    .then(newEvent => {
      res.send(newEvent);
    });
});

router.put("/events/:id", ensureAuthorisedUser, (req, res) => {
  if (!req.user.allowed_operation.includes("update"))
    return res.sendStatus(400);

  const { id } = req.params;
  const { memberId, billAmount } = req.body;

  Event.findByIdAndUpdate(
    id,
    { payer: memberId, bill_amount: billAmount },
    { new: true, runValidation: true }
  ).then(updatedEvent => res.send(updatedEvent));
});

router.delete("/events/:id", ensureAuthorisedUser, (req, res) => {
  if (!req.user.allowed_operation.includes("delete"))
    return res.sendStatus(400);

  const { id } = req.params;

  Event.findByIdAndRemove(id).then(updatedEvent => res.send(updatedEvent));
});

/*----------------members----------------*/
router.get("/members", ensureAuthorisedUser, (req, res) => {
  if (!req.user.allowed_operation.includes("read")) return res.send([]);

  Member.find().then(members => {
    res.send(members);
  });
});

router.put("/members/:id", ensureAuthorisedUser, async (req, res) => {
  if (!req.user.allowed_operation.includes("update"))
    return res.sendStatus(400);

  const { id } = req.params;
  const { allowedOperations } = req.body;

  const member = await Member.findById(id);

  if (!member) return res.sendStatus(404);

  member.allowed_operation = allowedOperations;

  const savedMember = await member.save();

  res.send(savedMember);
});

module.exports = router;

function verifyTokenId(tokenId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenId}`)
      .then(response => {
        Member.findOne({ googleId: response.data.sub }).then(currentUser => {
          if (currentUser) resolve({ existingUser: true, user: currentUser });
          else resolve({ existingUser: false, user: response.data });
        });
      })
      .catch(error => {
        if (error.response) reject(error.response);
      });
  });
}

function ensureAuthorisedUser(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.sendStatus(401);

  verifyTokenId(token)
    .then(result => {
      if (!result.existingUser) return res.sendStatus(400);

      req.user = result.user;
      next();
    })
    .catch(error => {
      if (error) res.sendStatus(error.status);
    });
}
