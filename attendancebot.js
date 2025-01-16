const { ActivityHandler } = require('botbuilder');
const { getAttendanceData } = require('./db'); // Import the DB query function

class Attendancebot extends ActivityHandler {
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        this.userState = this.conversationState.createProperty('userState'); // Create a property for storing user data

        this.onMessage(async (context, next) => {
            let userData = await this.userState.get(context, { step: 0 }); // Default step is 0

            const Usermessage = context.activity.text ? context.activity.text.toLowerCase() : '';

            switch (userData.step) {
                case 0:
                    // Ask for Employee ID
                    await context.sendActivity("Welcome! Can you provide an Employee ID to view attendance details?");
                    userData.step = 1;
                    break;

                case 1:
                    userData.employeeID = Usermessage;
                    // Ask for Date
                    await context.sendActivity(`Got it! For Employee ID: ${userData.employeeID}, on which date do you want the details for?`);
                    userData.step = 2;
                    break;

                case 2:
                    userData.date = Usermessage.toUpperCase();  // Ensure the date input is uppercase for consistency
                    await context.sendActivity(`Thanks! What specific detail are you looking for? (e.g., TIME_IN, TIME_OUT, BREAK_TIME, WORKING_TIME)`);
                    userData.step = 3;
                    break;

                case 3:
                    const employeeID = userData.employeeID;
                    const date = userData.date;
                    const detail = Usermessage.toUpperCase(); // Ensure the detail input is uppercase

                    // Query the Oracle database for the requested attendance data
                    const result = await getAttendanceData(employeeID, date, detail);

                    if (result) {
                        await context.sendActivity(`For Employee ID ${employeeID} on ${date}, ${detail} is ${result}.`);
                    } else {
                        await context.sendActivity(`Sorry, I couldn't find the details for ${detail} of Employee ID ${employeeID} on ${date}.`);
                    }

                    // Reset state after processing the request
                    userData.step = 0;
                    break;

                default:
                    await context.sendActivity("Sorry, I didn't understand. Let's start over.");
                    userData.step = 0;
                    break;
            }

            // Save the user state correctly using userState.saveChanges()
            await this.conversationState.saveChanges(context);
            await next();
        });
    }
}

module.exports = { Attendancebot };
