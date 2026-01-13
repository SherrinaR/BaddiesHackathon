import bot from './assets/bot.svg';
import user from './assets/user.svg';


/* target HTML elements using document.querySelector */
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const sideMenu = document.querySelector('#side_menu');
const newChat = document.querySelector('#new_chat');


let loadInterval;

/* implement bot loading before outputting response */
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

/* implement typing functionality one letter at a time */
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

/* generate a unique id for each message, via timestamping, to map over them. */
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

/* implement chat stripe for bot and user */
function chatStripe (isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

/* create handleSubmit to trigger getting the Ai generated response */
const handleSubmit = async (e) => {
  e.preventDefault(); // prevent default browser reload

  const data = new FormData(form); // get the data typed into form
  const userPrompt = data.get('prompt');

  // generate new user chat stripe
  chatContainer.innerHTML += chatStripe(false, userPrompt);

  // clear text input
  form.reset();

  // generate new bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // keep scrolling as new chats appear and stay in view
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // fetch the new message
  const messageDiv = document.getElementById(uniqueId);
  
  // load the new message
  loader(messageDiv);

   try {
    const response = await send(userPrompt);
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';
    typeText(messageDiv, response.answer);
  } catch (err) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = "Something went wrong.";
    console.error(err);
  }
};

/* "Ask about me" pop-message when button is clicked */
const popText = document.getElementById('btn_text');
const askButton = document.getElementById('ask_btn');

askButton.addEventListener('click', () => {
  popText.classList.remove('hidden');
  popText.classList.add('popup-message');
});

popText.addEventListener('animationend', () => {
  popText.classList.remove('popup-message');
  popText.classList.add('hidden');
});


/* Fetch data from OpenAI */
const textarea = document.querySelector('textarea');

async function send(prompt) {
  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: prompt }),
  });
  return await res.json();
  console.log("response from API:", res);  // shows response from FastAPI
}


/* fetch data from OpenAI server -> bot's response*/
// const resp = await fetch("http://127.0.0.1:5000/chat", { 
//   method: "POST", 
//   headers: { "Content-Type": "application/json" }, 
//   mode: 'cors',
//   body: JSON.stringify({ prompt: "message" }) });
// data = await resp.json();
// console.log(data.resp);


/* Clear interval after response is received to load next message */
// clearInterval(loadInterval);
// messageDiv.innerHTML = '';

// if(response.ok) {
//   const data = await response.json(); // get bot's response
//   const parsedData = data.bot.trim(); // need to parse the data

//   typeText(messageDiv, parsedData);
// } else {
//   const err = await response.text();

//   messageDiv.innerHTML = "Whoops! Something went wrong";

//   alert(err);
// }


/* load history of chats in the side menu */

/* regulate changes in submit events */
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})




