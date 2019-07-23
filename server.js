const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const todoRoutes = express.Router();
const mongoose = require('mongoose');

let Todo = require('./todo.model');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/todos', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
	console.log('MongoDB database connection established successfully');
});

app.use(function(error, req, res, next) {
	if (error instanceof SyntaxError) {
		//Handle SyntaxError here.
		return res.status(500).send({ data: 'Invalid data' });
	} else {
		next();
	}
});

todoRoutes.route('/').get(function(req, res) {
	Todo.find(function(err, todos) {
		if (err) {
			console.log(err);
		} else {
			res.json(todos);
		}
	});
});

todoRoutes.route('/add').post(function(req, res) {
	let todo = new Todo(req.body);
	todo.save()
		.then(todo => {
			res.status(200).json({ todo: 'todo added successfully' });
		})
		.catch(err => {
			res.status(400).send('adding new todo failed');
		});
});

todoRoutes.route('/:id').get(function(req, res) {
	let id = req.params.id;
	Todo.findById(id, function(err, todo) {
		res.json(todo);
	});
});

todoRoutes.route('/update/:id').put(function(req, res) {
	Todo.findById(req.params.id, function(err, todo) {
		if (!todo) res.status(404).send('data is not found');
		else todo.description = req.body.description;
		todo.responsible = req.body.responsible;
		todo.priority = req.body.priority;
		todo.completed = req.body.completed;

		todo.save()
			.then(todo => {
				res.json('Todo updated!');
			})
			.catch(err => {
				res.status(400).send('Update not possible');
			});
	});
});

todoRoutes.route('/delete/:id').delete(function(req, res) {
	Todo.findById(req.params.id, function(err, todo) {
		if (!todo) res.status(404).send('data is not found');
		else
			todo.delete()
				.then(todo => {
					res.json('Todo deleted!');
				})
				.catch(err => {
					res.status(400).send('Delete not possible');
				});
	});
});

app.use('/todos', todoRoutes);

app.listen(PORT, function() {
	console.log('Server is running on Port: ' + PORT);
});
