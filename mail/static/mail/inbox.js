document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  document.querySelector("#email-view").innerHTML=''
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#email-view").style.display='none' 


  document.querySelector("#compose-view").onsubmit=function(e){
   e.preventDefault()
   let recipients=document.querySelector("#compose-recipients").value
   let subject=document.querySelector("#compose-subject").value
   let body=document.querySelector("#compose-body").value

   fetch('/emails',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      recipients:recipients,
      subject:subject,
      body:body
    })   
  })
  .then(response=>response.json())
  .then(result=>{
      // console.log('result sent::',result)
      load_mailbox('sent')
      return result
  })
  .catch(err=>console.log(`Give me errors you found::${err}`))
  }

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //MY PART START
  let inboxContainer=document.createElement("div")
  inboxContainer.className="inbox-container"

  fetch(`/emails/${mailbox}`,{
   method:"GET",
  })
  .then(response=>response.json())
  .then(emails=>{
   // alert('fetch emails got triggered')
   //for loop
   emails.forEach(email=>{
      
      let div=document.createElement('div')
      div.className="sub-container"
      let emailContent=document.createElement('div')
      emailContent.className='email-content'
      if (email.read===true){
         emailContent.style.backgroundColor='#d3d3d3'
      }
      emailContent.addEventListener('click',function(){
         // alert('emailContent event listener got called')
         fetch(`/emails/${email.id}`,{
            method:"GET"
         })
         .then(response=>response.json())
         .then(received_email=>{         
            
            fetch(`/emails/${received_email.id}`,{
               method:"PUT",
               headers:{
                  "Content-Type":"application/json"
               },
               body:JSON.stringify({
                  read:true
               })
            })   
            //show email
            document.querySelector("#email-view").style.display = "block";
            document.querySelector("#emails-view").style.display = "none";
            let emailDiv=document.createElement("div")
               emailDiv.className="email-div"
               // emailDiv.innerHTML=`HELLO WORLD! ${email.sender} - ${email.body}`
               const p1 = document.createElement("p");
               const p2 = document.createElement("p");
               const p3 = document.createElement("p");
               const p4 = document.createElement("p");
               const body = document.createElement("p");
               const button3 = document.createElement("button");
               
               p1.innerHTML = `<strong>From: </strong>${email.sender}`;
               p2.innerHTML = `<strong>To: </strong>${email.recipients}`;
               p3.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;
               p4.innerHTML = `<strong>Subject: </strong>${email.subject}`;
               button3.innerHTML = `Reply`; 

               button3.addEventListener('click',()=>{
                  // TODO: REPLY THE EMAIL, CAREFUL
                  console.log('email received::',received_email)
                  document.querySelector('#email-view').style.display = 'none';
                  document.querySelector('#compose-view').style.display = 'block';
              
                  document.querySelector("#compose-recipients").value=received_email.recipients
                  console.log(document.querySelector("#compose-recipients").value)
 
                  document.querySelector("#compose-subject").value=received_email.subject.startsWith('Re: ')? received_email.subject : `Re: ${received_email.subject}`

                  console.log('subject::',document.querySelector("#compose-subject").value)

                  let prefilled_text=`On ${received_email.timestamp} [${received_email.sender}] wrote: ${received_email.body}`
                 
                  let composeBody=document.querySelector("#compose-body")
                  composeBody.value=`${prefilled_text}\n\n${composeBody.value}`
                  console.log(composeBody.value)                  
                  compose_email()
                  // alert('after compose_email() called')
                  
               })
               body.innerHTML = `${email.body}`;

               document.querySelector("#email-view").appendChild(emailDiv)
               emailDiv.appendChild(p1)
               emailDiv.appendChild(p2)
               emailDiv.appendChild(p3)
               emailDiv.appendChild(p4)
               emailDiv.appendChild(button3)
               emailDiv.appendChild(document.createElement('hr'))
               emailDiv.appendChild(body) 
         })
         //IMPORTANT, MUST HAVE
         document.querySelector("#email-view").innerHTML=''
      })
      let archiveButton=document.createElement('button')
      let unArchiveButton=document.createElement('button')
     
      let span=document.createElement('span')
      span.className="d-flex"
      let p1=document.createElement('p')
      let p2=document.createElement('p')
      let p3=document.createElement('p')      

      p1.innerHTML=`<strong>${email.sender}</strong>`
      p2.innerHTML=`${email.subject}`      
      p3.innerHTML=`${email.timestamp}`

      span.appendChild(p1)
      span.appendChild(p2)
      emailContent.appendChild(span)
      emailContent.appendChild(p3)    
      div.appendChild(emailContent)

      const setArchive =(email)=>{
         // document.querySelector("#email-view").innerHTML=''
         // setArchive(email)    
         // alert('archive btn click even got triggered')
         // console.log('archive btn click with email::',email)
         fetch(`/emails/${email.id}`,{
            method:"PUT",
            headers:{
               "Content-Type":"application/json"
            },
            body:JSON.stringify({
               archived:true
            })
         })
         .then(response=>{
            if(response.ok){
               load_mailbox('inbox')
            }
         })
      }
      if(mailbox==='inbox'){
         archiveButton.innerHTML=`<i class="bi bi-save2-fill"></i> Archive`
         archiveButton.className="archive-btn"
         div.appendChild(archiveButton)

         archiveButton.addEventListener('click',()=>setArchive(email))
      }
      const setUnarchive =(email)=>{
         // alert('unarchive btn got trigged')
         // console.log('email unarchive::',email)
         fetch(`/emails/${email.id}`,{
            method:"PUT",
            headers:{
               "Content-Type":"application/json"
            },
            body:JSON.stringify({
               archived:false
            })
         })
         .then(response=>{
            if (response.ok){
               load_mailbox('inbox')
            }
         })
      }
      if(mailbox==='archive'){
         unArchiveButton.innerHTML=`<i class="bi bi-arrow-up-square-fill"></i> Unarchive`
         unArchiveButton.className='unarchive-btn'
         div.appendChild(unArchiveButton)     
         
         unArchiveButton.addEventListener('click',()=>setUnarchive(email))      
      }
      inboxContainer.appendChild(div)  
      
  //end for loop
   })
  
   
  })
//   inboxContainer.appendChild(archiveButton)
  
  document.querySelector("#emails-view").appendChild(inboxContainer)
  //END 
}