# techdegree-project-11
a Course Rating API With Express

For running this project you need to install MongoDB, Postman and all npm packages listed in package.json file.

Recommended order of actions:
1. Download project files
2. Navigate to folder containig project files in the terminal with "cd" command, 
   run "npm install" in the terminal
   
3. Launch the app in the terminal with "npm start" command
   
   Note: steps 4 and 5 are written for Windows OS. If you are on Mac OS, launching MongoDB will be a little different.
   
4. Navigate to folder containing MongoDB and launch mongod.exe file.
   Examples of commands in the terminal:
   $ cd C:/'Program files'/MongoDB/Server/4.0
   $ bin/mongod
   
5. Navigate to folder containing MongoDB and launch mongo.exe file.
   Examples of commands in the terminal:
   $ cd C:/'Program files'/MongoDB/Server/4.0
   $ bin/mongo
   
6. Import collections from "seed-data" folder by running following commands in terminal:
	$ cd C:/'Program Files'/MongoDB/Server/4.0/bin
	Note: location of your MongoDB folder may be different; in any case you need to navigate to the "bin" folder inside it.
	 
   	$ ./mongoimport --db course-api --collection courses --type=json --jsonArray --file C:/projects/techdegree-project-11/seed-data/courses.json
	$ ./mongoimport --db course-api --collection users --type=json --jsonArray --file C:/projects/techdegree-project-11/seed-data/users.json
	$ ./mongoimport --db course-api --collection reviews --type=json --jsonArray --file C:/projects/techdegree-project-11/seed-data/reviews.json
    
7. Launch Postman:
	7.1 send a POST request to create a new user; check whether a document was created in "users" collection by typing in the terminal window
	where your mongo.exe file is launched:
		> use course-api
		> db.users.find().pretty()
	7.2	authenticate created user in "Authorization" tab in Postman by typing their email in "Username" field and their password in "Password" field
	7.3 send a GET request to look at authenticated user data
	7.4 send a POST request to create a new course (don't forget to authenticate the user in "Authorization" tab before sending a request; authenticate the user you created in step 7.1)
	7.5 check whether a new course was created in "courses" collection in MongoDB; type in terminal window where your mongo.exe is launched:
		> db.courses.find().pretty()
	7.6 send a PUT request to update the created course (authenticate user created in step 7.1 before sending a request); you'll need to paste the id of the created course in the route in Postman
	7.7 check whether the created course was updated - type in the terminal window where your mongo.exe file is launched:
		> db.courses.find().pretty()
	7.8 send a POST request to create a review for the created course (authenticate user created in step 7.1 before sending a request); you'll need to paste the id of the created course in the route in Postman
	7.9 check whether a review was created - type in the terminal window where your mongo.exe file is launched:
		> db.reviews.find().pretty()
		> db.courses.find().pretty()
   
   
