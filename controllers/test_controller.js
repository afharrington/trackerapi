// const Person = require('../models/PersonSchema.js');
//
// module.exports = {
//
//   create(req, res, next) {
//     const PersonProps = req.body;
//     Person.create(PersonProps)
//       .then(person => res.send(person))
//       .catch(next);
//   },
//
//
//   edit(req, res, next) {
//     const personId = req.params.id;
//     const personProps = req.body;
//
//     Person.findByIdAndUpdate({ _id: personId }, personProps)
//
//       // make a second query in order to send data back to the user
//       .then(() => Person.findById({ _id: personId }))
//       .then(person => res.send(person))
//       .catch(next);
//   },
//
//
//   delete(req, res, next) {
//     const personId = req.params.id;
//
//     Person.findByIdAndRemove({ _id: personId })
//       .then(person => res.status(204).send(person))
//       .catch(next);
//   },
//
// };
