//using a gloabl component for navigation
Vue.component("navigation", {
  template: `
      <nav class="navbar">
        <span class="logo">HabitBud</span>
        <ul class='navLinks'>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/achievements">Achievements</router-link></li>
          <li><router-link to="/settings">Settings</router-link></li>
        </ul>
      </nav>
  `,
});

//compoenent for habit tracking (user story 1)
const HabitComp = {
  template: `
    <div class="habitContainer">
      <input type="text" class="habitInput" v-model="newHabit" placeholder="Enter new habit">
      <button @click="addHabit" class="btn">Add habit</button>
      <ul class="habitList">
        <li v-for="(habit, index) in habits" :key="index" class="habitItem">
          <input type="checkbox" :id="'habit-' + index" v-model="habit.completed" class="habitCheckbox" @change="updateCheckboxStatus(index)">
          <label :for="'habit-' + index" :class="{ completed: habit.completed }" class="habitLabel" >
          {{ habit.name }}
        </label>
          <button @click="deleteHabit(index)" class="btn deleteBtn">Delete</button>
        </li>
      </ul>
    </div>
  `,
  data: function () {
    return {
      newHabit: "",
      habits: [],
    };
  },
  methods: {
    addHabit() {
      //adds a new habit the the array if the input field is not empty
      if (this.newHabit.trim() !== "") {
        this.habits.push({
          name: this.newHabit,
          completed: false,
        });
        this.newHabit = "";
        //stores the habit in localstorage using the setItem method
        //JSON.stingify converts the array to string to be stored
        localStorage.setItem("habits", JSON.stringify(this.habits));
      }
    },
    deleteHabit(index) {
      //this function is linked to the delete button next to each created habit
      //splice removes one element on that given index
      this.habits.splice(index, 1);
      localStorage.setItem("habits", JSON.stringify(this.habits));
      //updates value of habitCount in the local storage
      localStorage.setItem(
        "habitCount",
        //filters the array by completed and gets the number of habits using the .length method
        this.habits.filter((habit) => habit.completed).length
      );
    },
    updateCheckboxStatus(index) {
      localStorage.setItem("habits", JSON.stringify(this.habits));
      localStorage.setItem(
        "habitCount",
        this.habits.filter((habit) => habit.completed).length
      );
    },
  },
  mounted() {
    //mounted loads stored data into this componenet when its called onto the webpage. this allows the habit list to remain on the page after routing to different pages
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
      this.habits = JSON.parse(storedHabits);
    }
  },
};

//component for quote generation (user story 2)
const RandomQuote = {
  template: `
    <div class="quoteContainer">
        <p class='quote'>{{ currentQuote }}</p>
        <button class='btn' @click='changeQuote'>Randomise</button>
    </div>
    `,
  data: function () {
    return {
      //array of quotes
      quotes: [
        '"You are capable of doing amazing things"',
        '"The smallest acts of kindness create the biggest ripples"',
        '"Every challenge is an opportunity for growth"',
        '"Progress, not perfection, is what matters"',
        '"In the midst of chaos, find your inner calm"',
        '"Your journey is unique; embrace the adventure."',
      ],
      //index of displayed quote
      currentIndex: 0,
    };
  },
  computed: {
    //computed property that returns quote at certain index
    currentQuote: function () {
      return this.quotes[this.currentIndex];
    },
  },
  methods: {
    changeQuote: function () {
      //This function triggers when user clicks on randomise button
      //newIndex variable creation
      let newIndex = this.currentIndex;
      while (newIndex === this.currentIndex) {
        //creates a new index from a random number within the legnth of the quotes array
        newIndex = Math.floor(Math.random() * this.quotes.length);
      }
      //sets current index to newIndex number.
      this.currentIndex = newIndex;
    },
  },
};

//parent component to hold user story 1 and 2
const HomePage = {
  template: `
    <div>
      <habit-comp></habit-comp>
      <random-quote></random-quote>
    </div>
  `,
  components: {
    //this is a parent compoennt of the 2 child components
    "habit-comp": HabitComp,
    "random-quote": RandomQuote,
  },
};

//compoenent to track achievements (user story 3)
const AchievementsComp = {
  template: `
    <div>
      <p class='habitsCompleted'>You completed <strong>{{ completedHabits }}</strong> good habits!</p>

      <div class="achievementContainer">
        <div v-for="(achievement, index) in achievements" :key="index" class="achievementItem">
          <div class="achievement">
            <img :src="achievement.completed ? unlockedIcon : lockedIcon" alt="trophy">
            <p class="achievementText">{{ achievement.text }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      unlockedIcon: "./img/a2.png",
      lockedIcon: "./img/a1.png",
      habitsCompleted: 0,
      achievements: [
        { text: "Complete 1 habit", completed: false },
        { text: "Complete 5 habits", completed: false },
        { text: "Complete 10 habits", completed: false },
        { text: "Complete 15 habits", completed: false },
        { text: "Complete 20 habits", completed: false },
        { text: "Complete 25 habits", completed: false },
      ],
    };
  },
  computed: {
    completedHabits() {
      //gets count of habit completed, defaults to 0 if none
      return parseInt(localStorage.getItem("habitCount")) || 0;
    },
  },
  methods: {
    countAchievements() {
      //first achievement set to true if 1 habit completed
      if (this.completedHabits >= 1) {
        this.achievements[0].completed = true;
      }
      //with evey 5 habits completed, a new achievement is unlocked
      for (let i = 1; i < this.achievements.length; i++) {
        if (this.completedHabits >= i * 5) {
          if (!this.achievements[i].completed) {
            this.achievements[i].completed = true;
          }
          //else the acheivements stay locked
        } else {
          this.achievements[i].completed = false;
        }
      }
    },
    //function that runs
    updateAchievements() {
      this.countAchievements();
    },
  },
  //ensures at component creation, the achievments start to update. it stays that way until the reset button is pressed on the settings page
  created() {
    this.updateAchievements();
  },
};

//component to give feedback (updated user story 5)
const FeedbackComp = {
  template: `
    <div class="feedbackContainer">
      <h2>Feedback</h2>
      <form @submit="submitFeedback">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name" required>

        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>

        <label for="feedback">Feedback:</label>
        <textarea id="feedback" v-model="feedback" required></textarea>

        <button type="submit" class="btn">Submit Feedback</button>
      </form>
      <p v-if="feedbackSubmitted" class="thanksMessage">Thank you for your feedback!</p>
    </div>
  `,
  data() {
    return {
      name: "",
      email: "",
      feedback: "",
      //default to false so thanks message is hidden
      feedbackSubmitted: false,
    };
  },
  methods: {
    submitFeedback() {
      // feedback will be displayed to console as a mock implementation
      console.log("Name:", this.name);
      console.log("Email:", this.email);
      console.log("Feedback:", this.feedback);
      //when feedback is submitted the thanksMessage displays
      this.feedbackSubmitted = true;
    },
  },
};

//parent component of feedback with notifications (user story 4)
const SettingsComp = {
  template: `
  <div class='settingsContainer'>
    <div>
      <label for="reminderFrequency">Reminder Frequency:</label>
      <select v-model="selectedFrequency" @change="reminderFreq" id="reminderFrequency">
        <option value="never">Never</option>
        <option value="everyMinute">Every Minute</option>
        <option value="everyHour">Every Hour</option>
        <option value="everyDay">Every Day</option>
    </select>
    </div>
    <feedback-comp></feedback-comp>
    <hr>
    <button class='btn' @click="clearLocalStorage">Clear Local Storage</button>
  </div>
  `,
  data() {
    return {
      selectedFrequency: "never",
      intervals: {
        //time values here in minutes
        never: 0,
        everyMinute: 1,
        everyHour: 60,
        everyDay: 1440,
      },
      interval: null,
    };
  },
  methods: {
    clearLocalStorage() {
      //removes the stored data for the habits and habit tracker list resets.
      localStorage.removeItem("habits");
      // and habit count so the achievements reset
      localStorage.removeItem("habitCount");
      //and the reminders is reset to never
      clearInterval(this.interval);
      localStorage.removeItem("reminderStatus");
    },
    reminderFreq() {
      //sets time to
      const timeInMinutes = this.intervals[this.selectedFrequency];
      clearInterval(this.interval);

      //if option is more than 0 milliseconds (not never)
      if (timeInMinutes > 0) {
        //converts the minutes to milliseconds and setInterval function sends the browser prompt based on the value
        this.interval = setInterval(() => {
          window.alert("Time for your habit check!");
        }, timeInMinutes * 60 * 1000);
      }
      // Store the selected reminder status in localStorage
      localStorage.setItem("reminderStatus", this.selectedFrequency);
    },
    changeReminderFrequency() {
      // Retrieve the reminder status from localStorage
      const storedReminderStatus = localStorage.getItem("reminderStatus");

      if (storedReminderStatus) {
        this.selectedFrequency = storedReminderStatus;
        this.reminderFreq(); // Trigger the function to set the interval based on the stored status
      }
    },
  },
  //runs this function when the component is created
  created() {
    this.changeReminderFrequency();
  },
  //clears the intervals when compoenent is destroyed
  destroyed() {
    clearInterval(this.interval);
  },
  //since feedback comp is a child component of settings
  components: {
    "feedback-comp": FeedbackComp,
  },
};

//router with routes defined
const router = new VueRouter({
  routes: [
    //homepage is the root so it's named '/'
    { path: "/", component: HomePage },
    { path: "/achievements", component: AchievementsComp },
    { path: "/settings", component: SettingsComp },
  ],
});

//declaring vue instance
new Vue({
  //entire html body is encased in this element
  el: "#app",
  //referencing router here to route to components
  router,
});
