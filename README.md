# Clocker.in *(June 2019 - February 2020)*

## About
A 'group' effort for the courses Computing Project I & II (ISY10221/ISY10222). This project involved meeting with stakeholders to develop a program that would best address their needs, in this case being an efficient and simple way for the employees of an IT consultancy firm to clock-in/out of work. The course required that the project closely follow the waterfall SDLC model which, to say the least, involved the extensive production of technical documentation and a lengthy testing phase after the product's initial development.

This is easily the largest and most ambitious project I have ever worked on. Across both courses, maximum grades (HD+) were obtained for every assessment item.

NOTE: An Android mobile application was developed seperately to be used in conjunction with this web application (presumably by employees), however this is not included within this repository.

## Technology stack
The web application was developed using the following technologies:
- Node.js
- Javascript
- jQuery
- Bootstrap
- SQLite
- Firebase (for handling mobile push notifications)

The mobile application primarily loaded pages generated via the web app and displayed them through a "web container". It was developed for Android platforms with Java.

## Functionality
### Administrators can:
- Create/update/delete accounts for employees
- Organise workgroups, consisting of multiple employees
- Specify physical boundaries of 'workzones' where shifts will occur 
- Create and assign shifts a start/end time and a designated workzone (with sufficient valiation/error checking), as well as the appropriate workgroups or employees that the shift will be assigned to
- Access reporting measures that summarise the 'shift attendances' of a specific employee/workgroup within a specified timeframe - this is delivered as a .PDF file via direct download and/or email

### Employees can:
 - Log-in/out and request password resets (as can administrators)
 - View details of their upcoming shifts on a week-by-week basis
 - Clock into/out of a shift that they have been assigned (from either the mobile application or the web application via an "kiosk" installed onsite)
 - Receieve push notifications on their mobile device when they physically enter/exit a workplace that they have been assigned a shift to, assuming that they are approximately within the shift's specified timeframe - these notifications prompt the employee to clock-in/out

## Reflection
As a brief look into the source code will reveal, there exists potential security vulnerabilities such as SQL injection due to the lack of prepared/sanitised database statements. During the project's development, I was not aware of such issues and only independently learnt about them afterwards.

The mobile application's web container-based interface did not provide a satisfying/responsive enough user experience. It is believed that this could have been addressed through utilising a cross-platform mobile framework that harnessed the existing web development knowledge of the team (e.g. React Native, Ionic, etc.). 
