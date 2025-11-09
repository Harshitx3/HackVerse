const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const users = [
    {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Aspiring full-stack developer with a passion for creating beautiful and functional web applications.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        githubUsername: 'aarav-sharma',
        linkedinUrl: 'https://www.linkedin.com/in/aarav-sharma',
        profileCompleted: true,
    },
    {
        fullName: 'Diya Patel',
        email: 'diya.patel@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Frontend developer who loves to create intuitive user interfaces with React and Tailwind CSS.',
        skills: ['React', 'Tailwind CSS', 'JavaScript', 'Figma'],
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        githubUsername: 'diya-patel',
        linkedinUrl: 'https://www.linkedin.com/in/diya-patel',
        profileCompleted: true,
    },
    {
        fullName: 'Rohan Kumar',
        email: 'rohan.kumar@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Backend developer specializing in Node.js and MongoDB. Always eager to learn new technologies.',
        skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
        profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
        githubUsername: 'rohan-kumar',
        linkedinUrl: 'https://www.linkedin.com/in/rohan-kumar',
        profileCompleted: true,
    },
    {
        fullName: 'Ananya Singh',
        email: 'ananya.singh@example.com',
        password: 'password123',
        role: 'designer',
        bio: 'UI/UX designer with a keen eye for detail. I enjoy creating user-centric designs that are both beautiful and easy to use.',
        skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping'],
        profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
        githubUsername: 'ananya-singh',
        linkedinUrl: 'https://www.linkedin.com/in/ananya-singh',
        profileCompleted: true,
    },
    {
        fullName: 'Vivaan Gupta',
        email: 'vivaan.gupta@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Full-stack developer with experience in the MERN stack. I enjoy building scalable and maintainable applications.',
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
        githubUsername: 'vivaan-gupta',
        linkedinUrl: 'https://www.linkedin.com/in/vivaan-gupta',
        profileCompleted: true,
    },
    {
        fullName: 'Isha Sharma',
        email: 'isha.sharma@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Frontend developer who is passionate about creating responsive and accessible websites.',
        skills: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
        profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
        githubUsername: 'isha-sharma',
        linkedinUrl: 'https://www.linkedin.com/in/isha-sharma',
        profileCompleted: true,
    },
    {
        fullName: 'Arjun Reddy',
        email: 'arjun.reddy@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Backend developer with a focus on building robust and scalable APIs with Python and Django.',
        skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
        profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg',
        githubUsername: 'arjun-reddy',
        linkedinUrl: 'https://www.linkedin.com/in/arjun-reddy',
        profileCompleted: true,
    },
    {
        fullName: 'Saanvi Rao',
        email: 'saanvi.rao@example.com',
        password: 'password123',
        role: 'designer',
        bio: 'Product designer who loves to solve complex problems with simple and elegant solutions.',
        skills: ['Product Design', 'User Research', 'Wireframing', 'Figma'],
        profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
        githubUsername: 'saanvi-rao',
        linkedinUrl: 'https://www.linkedin.com/in/saanvi-rao',
        profileCompleted: true,
    },
    {
        fullName: 'Kabir Khan',
        email: 'kabir.khan@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Mobile developer with experience in building native Android and iOS applications.',
        skills: ['Java', 'Kotlin', 'Swift', 'Firebase'],
        profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg',
        githubUsername: 'kabir-khan',
        linkedinUrl: 'https://www.linkedin.com/in/kabir-khan',
        profileCompleted: true,
    },
    {
        fullName: 'Myra Reddy',
        email: 'myra.reddy@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Full-stack developer who enjoys working with modern JavaScript frameworks like Vue.js and Svelte.',
        skills: ['Vue.js', 'Svelte', 'JavaScript', 'GraphQL'],
        profilePicture: 'https://randomuser.me/api/portraits/women/10.jpg',
        githubUsername: 'myra-reddy',
        linkedinUrl: 'https://www.linkedin.com/in/myra-reddy',
        profileCompleted: true,
    },
    {
        fullName: 'Advik Sharma',
        email: 'advik.sharma@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'DevOps engineer with a passion for automating and streamlining the development process.',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg',
        githubUsername: 'advik-sharma',
        linkedinUrl: 'https://www.linkedin.com/in/advik-sharma',
        profileCompleted: true,
    },
    {
        fullName: 'Zara Khan',
        email: 'zara.khan@example.com',
        password: 'password123',
        role: 'designer',
        bio: 'Graphic designer who loves to create visually appealing and impactful designs.',
        skills: ['Adobe Illustrator', 'Adobe Photoshop', 'Graphic Design', 'Branding'],
        profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
        githubUsername: 'zara-khan',
        linkedinUrl: 'https://www.linkedin.com/in/zara-khan',
        profileCompleted: true,
    },
    {
        fullName: 'Ishaan Patel',
        email: 'ishaan.patel@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Data scientist who enjoys working with large datasets and building machine learning models.',
        skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
        profilePicture: 'https://randomuser.me/api/portraits/men/13.jpg',
        githubUsername: 'ishaan-patel',
        linkedinUrl: 'https://www.linkedin.com/in/ishaan-patel',
        profileCompleted: true,
    },
    {
        fullName: 'Anika Gupta',
        email: 'anika.gupta@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Cybersecurity enthusiast who is passionate about protecting systems and data from cyber threats.',
        skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Cryptography'],
        profilePicture: 'https://randomuser.me/api/portraits/women/14.jpg',
        githubUsername: 'anika-gupta',
        linkedinUrl: 'https://www.linkedin.com/in/anika-gupta',
        profileCompleted: true,
    },
    {
        fullName: 'Reyansh Singh',
        email: 'reyansh.singh@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Game developer who loves to create immersive and engaging games with Unity and C#.',
        skills: ['Unity', 'C#', 'Game Development', 'Blender'],
        profilePicture: 'https://randomuser.me/api/portraits/men/15.jpg',
        githubUsername: 'reyansh-singh',
        linkedinUrl: 'https://www.linkedin.com/in/reyansh-singh',
        profileCompleted: true,
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await User.deleteMany({});
        await User.insertMany(users);

        console.log('Database seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.connection.close();
    }
};

seedDB();