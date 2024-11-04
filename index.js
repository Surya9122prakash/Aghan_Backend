const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken')
const app = express();
const port = 5000;
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'aghan123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const MAX_DIRECT_REFERRALS = 6;
const MAX_LEVELS = 6;
const DIRECT_REFERRAL_INCOME = 500;
const REBIRTH_WALLET_INCOME = 150;
const TOTAL_REFERRALS_FOR_REBIRTH = 42;

// const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'Aghan',
// };

const dbConfig = {
    host: 'aghan.cpo2mkusmn5r.eu-north-1.rds.amazonaws.com', 
    user: 'admin',             
    password: 'Admin123',                
    database: 'aghan',           
    port: 3306                                
};


const pool = mysql.createPool(dbConfig);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dirssp2002@gmail.com',
        pass: 'jwoa qfke xzyk lrls'
    }
});

const JWT_SECRET = 'aghan123';

let genealogyTree = {
    id: "AP5678", // Root user ID
    users: []
};

function generateOTP(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = (hash << 5) - hash + email.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % 1000000).toString().padStart(6, '0');
}

function generateRandomId() {
    const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    return `AP${randomNumber}`;
}

app.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOTP(email);

        const mailOptions = {
            from: 'dirssp2002@gmail.com',
            to: email,
            subject: 'Your OTP for Verification (Aghan Promoters)',
            html: `
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <table width="600" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#000000">
                                        <div style="width: 100%; max-width: 600px; height: 100px; background-color: #091023; display: table;">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td align="start" style="width: 100%; height: 100%">
                                                        <img src="https://i.ibb.co/bvY6L8Y/aghan-logo-english.png" width="30%" style="display: block; margin: 0 auto" alt="Logo" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <div style="width: 100%; max-width: 600px; height: 500px; background-color: white; display: table;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 90px">
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 160%"><b>Welcome to</b></p>
                                            <p style="color: black; text-align: center; font-size: 160%"><b>AGHAN PROMOTERS</b></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 120%">Verification code for Registration</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <div style="color: black; text-align: center; font-size: 120%">
                                                Your Verification Code :
                                                <span style="background-color: #f15529; color: white; padding: 5px; border-radius: 5px;"><b>${otp}</b></span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 120%">Please don't share with anyone</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <div style="width: 100%; max-width: 600px; height: 100px; background-color: #39afa8; display: table; padding-bottom: 20px;">
                                <div>
                                    <p style="color: white; font-size: 150%"><b>JOIN OUR TEAM</b></p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 100%">Check our Aghan Promoters Blog for new publications</p>
                                </div>
                                <div>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr align="center">
                                            <td>
                                                <a href="https://www.facebook.com/profile.php?id=61557114009922"><img src="https://i.ibb.co/4Z0LDK9/1.png" width="8%" style="display: block; margin: 0 auto" alt="Logo" /></a>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 100%">Click here to share your Aghan Promoters story, photos, and videos with the world!</p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 160%"><b>AGHAN PROMOTERS LLP</b></p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 105%">NO.1/198, Middle Street, Kiliyur & Post, Ulundurpet Taluk,</p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 105%">Kallakurichi District, Tamilnadu, India - 606102</p>
                                </div>
                                <div style="padding-top: 20px">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr style="font-size: 100%" align="center">
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                                    <img src="https://i.ibb.co/cYMpqRK/8.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="tel:+917598818884">
                                                    <img src="https://i.ibb.co/0KPCM7c/9.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                                    <img src="https://i.ibb.co/Sw9FdSc/10.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr style="font-size: 90%" align="center">
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black;" href="https://aghan.in/"><b>https://aghan.in/</b></a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black;" href="mailto:support@aghan.in"><b>support@aghan.in</b></a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <br />
                                                <a style="text-decoration: none; color: black;" href="tel:+917598818884"><b>+91 75988 18884</b></a>
                                                <br />
                                                <a style="text-decoration: none; color: black;" href="tel:+917598818885"><b>+91 75988 18885</b></a>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully!' });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }
});

async function findAndPlaceUser(userId, introducerId) {
    console.log('userId:', userId, 'IntroducerId:', introducerId);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Retrieve ancestor levels from `users` table
        const ancestorLevels = await getAncestorLevels(introducerId);

        // Step 2: Insert the new user with ancestor data into genealogy table
        await connection.execute(
            `INSERT INTO genealogy (user_id, level1, level2, level3, level4, level5, level6)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                ancestorLevels[0] || null,
                ancestorLevels[1] || null,
                ancestorLevels[2] || null,
                ancestorLevels[3] || null,
                ancestorLevels[4] || null,
                ancestorLevels[5] || null
            ]
        );

        // Step 3: Search for any user's first available empty slot to place the new user
        const [randomRows] = await connection.execute(
            `SELECT user_id, member1, member2, member3, member4, member5, member6 
            FROM genealogy 
            WHERE member1 IS NULL 
                OR member2 IS NULL 
                OR member3 IS NULL 
                OR member4 IS NULL 
                OR member5 IS NULL 
                OR member6 IS NULL 
            LIMIT 1`
        );

        if (randomRows.length > 0) {
            const randomUser = randomRows[0];
            for (let i = 1; i <= 6; i++) {
                const memberSlot = `member${i}`;
                if (randomUser[memberSlot] === null) {
                    // Step 4: Update random user's member slot with new user
                    await connection.execute(
                        `UPDATE genealogy SET ${memberSlot} = ? WHERE user_id = ?`,
                        [userId, randomUser.user_id]
                    );
                    console.log(`User ${userId} placed under random user ${randomUser.user_id} in slot ${memberSlot}`);

                    // Commit transaction and exit
                    await connection.commit();
                    return;
                }
            }
        } else {
            console.log('No available slots found for the new user');
        }
    } catch (error) {
        console.error('Error placing user:', error);
        await connection.rollback();
    } finally {
        connection.release();  // Release the connection back to the pool
    }
}

// Helper function to get ancestor levels up to 6 levels
async function getAncestorLevels(introducerId) {
    const connection = await pool.getConnection();
    const ancestorLevels = [introducerId];
    let currentId = introducerId;

    for (let i = 1; i < 6; i++) {
        if (!currentId) break;

        // Fetch the current ancestor's introducer from `users` table
        const [rows] = await connection.execute(
            `SELECT introducer_id FROM users WHERE user_id = ?`, [currentId]
        );

        if (rows.length > 0 && rows[0].introducer_id) {
            ancestorLevels.push(rows[0].introducer_id);
            currentId = rows[0].introducer_id;
        } else {
            break;
        }
    }

    await connection.release();
    return ancestorLevels.slice(0, 6);
}

async function getAncestorLevelsFromGenealogy(userId) {
    let currentUserId = userId;
    const ancestors = [];
    const connection = await pool.getConnection();

    for (let level = 1; level <= 6; level++) {
        const [result] = await connection.execute(
            `SELECT user_id 
             FROM genealogy 
             WHERE member1 = ? 
                OR member2 = ? 
                OR member3 = ? 
                OR member4 = ? 
                OR member5 = ? 
                OR member6 = ? 
             LIMIT 1`,
            [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
        );

        if (result.length === 0) {
            break; // No ancestor found for this level
        }

        // Set the ancestor id and update currentUserId to keep moving up the tree
        const ancestorId = result[0].user_id;
        ancestors.push(ancestorId);
        currentUserId = ancestorId;
    }
    return ancestors;
}

async function updateAncestorLevelsInGenealogy(userId) {
    const connection = await pool.getConnection();
    const maxRetries = 3;
    let attempt = 0;

    try {
        // Step 1: Fetch ancestor levels outside of the transaction
        const ancestors = await getAncestorLevelsFromGenealogy(userId);
        console.log(ancestors)

        // Retry mechanism in case of lock timeout
        while (attempt < maxRetries) {
            try {
                await connection.beginTransaction();

                // Step 2: Update genealogy table with ancestor levels within transaction
                await connection.execute(
                    `UPDATE genealogy
                     SET treeLevel1 = ?, treeLevel2 = ?, treeLevel3 = ?, treeLevel4 = ?, treeLevel5 = ?, treeLevel6 = ?
                     WHERE user_id = ?`,
                    [
                        ancestors[0] || null,
                        ancestors[1] || null,
                        ancestors[2] || null,
                        ancestors[3] || null,
                        ancestors[4] || null,
                        ancestors[5] || null,
                        userId
                    ]
                );

                await connection.commit();
                console.log(`Ancestor levels for user ${userId} updated successfully.`);
                break; // Exit retry loop if successful

            } catch (error) {
                // Handle lock timeout by retrying the transaction
                if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
                    console.warn(`Lock wait timeout exceeded, retrying... Attempt ${attempt + 1} of ${maxRetries}`);
                    await connection.rollback();
                    attempt++;
                } else {
                    // For other errors, throw
                    throw error;
                }
            }
        }

        if (attempt === maxRetries) {
            console.error(`Failed to update ancestor levels after ${maxRetries} attempts`);
        }

    } catch (error) {
        console.error('Error updating ancestor levels:', error);
    } finally {
        connection.release();
    }
}

// --- UPDATED buildNestedTree function ---
function buildNestedTree(referrals, parentId, visited = new Set()) {
    if (visited.has(parentId)) {
        return [];
    }

    visited.add(parentId);

    const nestedTree = [];

    const parentEntry = referrals.find((item) => item.user_id === parentId);

    if (parentEntry) {
        for (let i = 1; i <= MAX_DIRECT_REFERRALS; i++) {
            const memberId = parentEntry[`member${i}`];
            if (memberId) {
                nestedTree.push({
                    ReferrerID: memberId,
                    level: parentEntry.TreeLevel + 1,
                    user_id: memberId,
                    children: buildNestedTree(referrals, memberId, visited),
                });
            }
        }
    }

    return nestedTree;
}

async function getGenealogyTree(userId) {
    try {
        const [referrals] = await pool.query('SELECT * FROM genealogy');
        const rootUser = userId || 'AP5678';
        const nestedJson = {
            ReferrerID: rootUser,
            level: 0,
            user_id: rootUser,
            children: buildNestedTree(referrals, rootUser),
        };
        return nestedJson;
    } catch (error) {
        console.error('Error fetching genealogy tree:', error);
        throw error;
    }
}

async function creditDirectReferralIncome(referrerId, amount, userId) {
    try {
        const [ancestors] = await pool.query(`
            SELECT treeLevel1, treeLevel2, treeLevel3, treeLevel4 
            FROM genealogy 
            WHERE user_id = ?
        `, [userId]);

        if (ancestors.length === 0) {
            console.log("No ancestors found for user:", userId);
            return; // Or handle the case where the user has no ancestors appropriately
        }

        const ancestorIds = Object.values(ancestors[0]).filter(id => id !== null); // Filter out null values

        if (ancestorIds.length === 0) {
            console.log("No eligible ancestors for rebirth income for user:", userId);
            return;
        }
        // Update the user's wallet balance
        await pool.query(
            `UPDATE users SET balance = balance + ? WHERE user_id = ?`,
            [amount, referrerId]
        );
        console.log(`Direct referral income of ₹${amount} credited to user ${referrerId}`);

        // Record the transaction in wallettransactions
        await pool.query(
            `INSERT INTO wallettransactions (TransactionID, UserID, Amount, TransactionType, ReferralID) VALUES (UUID(), ?, ?, 'DIRECT_REFERRAL', ?)`,
            [referrerId, amount, userId]
        );
        console.log(`Transaction recorded for user ${referrerId}: ₹${amount} - DIRECT_REFERRAL`);

    } catch (error) {
        console.error('Error crediting direct referral income:', error);
        throw error;
    }
}


async function handleRebirthIncome(userId) {
    const rebirthIncome = REBIRTH_WALLET_INCOME;

    try {
        const [ancestors] = await pool.query(`
            SELECT treeLevel1, treeLevel2, treeLevel3, treeLevel4 
            FROM genealogy 
            WHERE user_id = ?
        `, [userId]);

        if (!ancestors || ancestors.length === 0) {
            console.log("No ancestors found for user:", userId);
            return;
        }

        console.log("@ancs", ancestors)

        const ancestorIds = Object.values(ancestors[0]).filter(id => id !== null);

        if (ancestorIds.length === 0) {
            console.log("No eligible ancestors for rebirth income for user:", userId);
            return;
        }
        console.log("@ancsids", ancestorIds)

        await pool.query(`
            UPDATE users
            SET rebirth_balance = rebirth_balance + ?
            WHERE user_id IN (?)
        `, [rebirthIncome, ancestorIds]);

        await Promise.all(ancestorIds.map(async (ancestorId) => {
            await pool.query(`
                INSERT INTO wallettransactions (TransactionID, UserID, Amount, TransactionType, ReferralID) 
                VALUES (UUID(), ?, ?, 'REBIRTH_INCOME', ?)
            `, [ancestorId, rebirthIncome, userId]);
            console.log(`Rebirth income of ₹${rebirthIncome} credited to ancestor ${ancestorId} from user ${userId}`);
        }));

    } catch (error) {
        console.error("Error handling rebirth income:", error);
        throw error;
    }
}

async function countDescendants(userId) {
    try {
        const [result] = await pool.query(
            `SELECT COUNT(*) as total FROM users WHERE introducer_id = ?`,
            [userId]
        );
        console.log(result)
        return result[0].total;
    } catch (error) {
        console.error('Error counting descendants:', error);
        throw error;
    }
}

app.post('/register', async (req, res) => {
    const connection = await pool.getConnection(); // Start a transaction
    await connection.beginTransaction();

    try {
        const {
            introducer_id,
            username,
            email,
            otp,
            address,
            city,
            zipcode,
            country,
            state,
            password,
            confirmPassword
        } = req.body;
        console.log("@req.body", req.body)
        const requiredFields = ['username', 'email', 'otp', 'address', 'city', 'zipcode', 'country', 'state', 'password', 'confirmPassword'];
        const nullFields = requiredFields.filter(field => req.body[field] === null);

        if (nullFields.length > 0) {
            const fieldsString = nullFields.join(', ');
            return res.status(400).json({ message: `Fields ${fieldsString} are required.` });
        }

        const effectiveIntroducerId = introducer_id || 'AP5678';
        const introducerExists = await validateIntroducerId(effectiveIntroducerId);
        if (!introducerExists) {
            return res.status(400).json({ message: 'Invalid Introducer ID' });
        }

        // Additional validation checks
        if (effectiveIntroducerId !== 'AP5678' && effectiveIntroducerId.length < 7) {
            return res.status(400).json({ message: 'Introducer Id must be at least 7 characters long.' });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (otp.length !== 6 || isNaN(otp)) {
            return res.status(400).json({ message: 'Invalid OTP. OTP must be 6 digits.' });
        }

        if (zipcode.length !== 6) {
            return res.status(400).json({ message: 'Invalid Zipcode. Zipcode must be 6 digits.' });
        }

        if (password.length < 5) {
            return res.status(400).json({ message: 'Password must be at least 5 characters long' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Verify OTP
        const regeneratedOTP = generateOTP(email);
        if (regeneratedOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const user_id = generateRandomId();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists
        const [existingUser] = await pool.query('SELECT 1 FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Insert user into the database
        await connection.query(
            `INSERT INTO users (user_id, introducer_id, username, email, address, city, zipcode, country, state, password) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, effectiveIntroducerId, username, email, address, city, zipcode, country, state, hashedPassword]
        );
        await findAndPlaceUser(user_id, effectiveIntroducerId);
        // Send email with user_id

        await updateAncestorLevelsInGenealogy(user_id);
        const mailOptions = {
            from: 'dirssp2002@gmail.com',
            to: email,
            subject: 'Your Aghan Promoters ID',
            html: `                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td align="center" bgcolor="#ffffff">
                    <table width="600" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="center" bgcolor="#000000">
                                <div style="width: 100%; max-width: 600px; height: 100px; background-color: #091023; display: table;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="start" style="width: 100%; height: 100%">
                                                <img src="https://i.ibb.co/bvY6L8Y/aghan-logo-english.png" width="30%" style="display: block; margin: 0 auto" alt="Logo" />
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td align="center" bgcolor="#ffffff">
                    <div style="width: 100%; max-width: 600px; height: 500px; background-color: white; display: table;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 90px">
                            <tr>
                                <td align="center" style="width: 60%; height: 100%">
                                    <p style="color: black; text-align: center; font-size: 160%"><b>Welcome to</b></p>
                                    <p style="color: black; text-align: center; font-size: 160%"><b>AGHAN PROMOTERS</b></p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="width: 60%; height: 100%">
                                    <p style="color: black; text-align: center; font-size: 120%">Your registration is successful.</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="width: 60%; height: 100%">
                                    <div style="color: black; text-align: center; font-size: 120%">
                                        Your Aghan Promoters ID is:
                                        <span style="background-color: #f15529; color: white; padding: 5px; border-radius: 5px;"><b>${user_id}</b></span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="width: 60%; height: 100%">
                                    <p style="color: black; text-align: center; font-size: 120%">Please keep this ID safe for login.</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" bgcolor="#ffffff">
                    <div style="width: 100%; max-width: 600px; height: 100px; background-color: #39afa8; display: table; padding-bottom: 20px;">
                        <div>
                            <p style="color: white; font-size: 150%"><b>JOIN OUR TEAM</b></p>
                        </div>
                        <div>
                            <p style="color: white; font-size: 100%">Check our Aghan Promoters Blog for new publications</p>
                        </div>
                        <div>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr align="center">
                                    <td>
                                        <a href="https://www.facebook.com/profile.php?id=61557114009922"><img src="https://i.ibb.co/4Z0LDK9/1.png" width="8%" style="display: block; margin: 0 auto" alt="Logo" /></a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <p style="color: white; font-size: 100%">Click here to share your Aghan Promoters story, photos, and videos with the world!</p>
                        </div>
                        <div>
                            <p style="color: white; font-size: 160%"><b>AGHAN PROMOTERS LLP</b></p>
                        </div>
                        <div>
                            <p style="color: white; font-size: 105%">NO.1/198, Middle Street, Kiliyur & Post, Ulundurpet Taluk,</p>
                        </div>
                        <div>
                            <p style="color: white; font-size: 105%">Kallakurichi District, Tamilnadu, India - 606102</p>
                        </div>
                        <div style="padding-top: 20px">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr style="font-size: 100%" align="center">
                                    <td style="width: 33.33%">
                                        <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                            <img src="https://i.ibb.co/cYMpqRK/8.png" width="30" height="30" alt="Logo" />
                                        </a>
                                    </td>
                                    <td style="width: 33.33%">
                                        <a style="text-decoration: none; color: black" href="tel:+917598818884">
                                            <img src="https://i.ibb.co/0KPCM7c/9.png" width="30" height="30" alt="Logo" />
                                        </a>
                                    </td>
                                    <td style="width: 33.33%">
                                        <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                            <img src="https://i.ibb.co/Sw9FdSc/10.png" width="30" height="30" alt="Logo" />
                                        </a>
                                    </td>
                                </tr>
                                <tr style="font-size: 90%" align="center">
                                    <td style="width: 33.33%">
                                        <a style="text-decoration: none; color: black;" href="https://aghan.in/"><b>https://aghan.in/</b></a>
                                    </td>
                                    <td style="width: 33.33%">
                                        <a style="text-decoration: none; color: black;" href="mailto:support@aghan.in"><b>support@aghan.in</b></a>
                                    </td>
                                    <td style="width: 33.33%">
                                        <br />
                                        <a style="text-decoration: none; color: black;" href="tel:+917598818884"><b>+91 75988 18884</b></a>
                                        <br />
                                        <a style="text-decoration: none; color: black;" href="tel:+917598818885"><b>+91 75988 18885</b></a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
                </table>`
        };
        await transporter.sendMail(mailOptions);

        await connection.commit();

        res.status(201).json({ message: 'User registered successfully. Your ID has been sent to your email.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Registration failed. Please try again later.' });
    } finally {
        connection.release();
    }
});

app.get('/tree', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        const genealogyTree = await getGenealogyTree(userId);
        res.json({ genealogyTree }); // Send the entire tree (client-side filtering/rendering)

    } catch (error) {
        console.error('Error in /tree route:', error);
        res.status(500).json({ message: 'Failed to fetch genealogy tree.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID is required.',
                alertType: 'warning'
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'ID is required.',
                alertType: 'warning'
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid ID or password.',
                alertType: 'danger'
            });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid ID or password.',
                alertType: 'danger'
            });
        }

        const payload = {
            userId: user.user_id,
        }

        const token = jwt.sign(payload, JWT_SECRET);

        req.session.token = token;

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            alertType: 'success',
            token: token
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again later.',
            alertType: 'danger'
        });
    }
});

app.post('/admin/login', async (req, res) => {
    try {
        const { id, password } = req.body;
        console.log(id, password)

        if (!id || !password) {
            return res.status(400).json({
                success: false,
                message: 'ID and Password are required fields.',
                alertType: 'warning'
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid ID or password.',
                alertType: 'danger'
            });
        }


        const user = users[0];
        // const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log(passwordMatch)
        console.log(user)


        if (password === user.password && user.role === 'admin') {
            const payload = {
                userId: user.user_id,
                role: user.role
            };
            const token = jwt.sign(payload, JWT_SECRET);

            req.session.token = token;

            res.status(200).json({
                success: true,
                message: 'Admin login successful!',
                alertType: 'success',
                token: token,
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid admin credentials.',
                alertType: 'danger'
            });
        }

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({
            success: false,
            message: 'Admin login failed. Please try again later.',
            alertType: 'danger'
        });
    }
});

async function validateIntroducerId(introducerId) {
    try {
        const [rows] = await pool.query('SELECT username FROM users WHERE user_id = ?', [introducerId]);
        return rows.length > 0 ? rows[0].username : null;
    } catch (error) {
        console.error('Error validating introducer ID:', error);
        throw error;
    }
}

app.get('/validate-introducer', async (req, res) => {
    const introducerId = req.query.introducerId;

    try {
        const username = await validateIntroducerId(introducerId);
        res.json({ exists: !!username, username });
    } catch (error) {
        console.error('Error validating introducer ID:', error);
        res.status(500).json({ error: 'Failed to validate introducer ID' });
    }
});

app.get('/validate-id', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const username = await validateIntroducerId(id);
        res.json({ exists: !!username, username });
    } catch (error) {
        console.error('Error validating User ID:', error);
        res.status(500).json({ error: 'Failed to validate introducer ID' });
    }
});

app.get('/topup-history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [history] = await pool.query('SELECT * FROM user_topup WHERE user_id = ? ORDER BY topup_date DESC', [userId]);
        res.json({ history });

    } catch (error) {
        console.error('Error fetching top-up history:', error);
        res.status(500).json({ message: 'Failed to fetch top-up history' });
    }
});

app.get('/personal', authenticateToken, async (req, res) => {
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId])

    const user = users[0]
    console.log(user)
    res.status(200).json({
        success: true,
        user: user
    });
})

app.post('/add-funds', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, transaction_id } = req.body;

        if (!amount || !transaction_id) {
            return res.status(400).json({ message: 'Amount and Transaction ID are required.' });
        }

        const requestId = uuidv4();

        const [result] = await pool.query(
            'INSERT INTO add_funds (user_id, amount, transaction_id, request_id) VALUES (?, ?, ?, ?)',
            [userId, amount, transaction_id, requestId]
        );

        if (result.affectedRows === 1) {
            res.status(201).json({ message: 'Add funds request submitted successfully!' });
        } else {
            res.status(500).json({ message: 'Failed to submit add funds request.' });
        }

    } catch (error) {
        console.error('Error adding funds:', error);
        res.status(500).json({ message: 'Add funds request failed. Please try again later.' });
    }
});

app.get('/validate-email', async (req, res) => {
    const email = req.query.email;
    try {
        const [rows] = await pool.query('SELECT 1 FROM users WHERE email = ?', [email]);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Error validating email:', error);
        res.status(500).json({ error: 'Failed to validate email' });
    }
});

app.get('/user', authenticateToken, async (req, res) => {
    try {

        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        const user = users[0];
        // console.log(user)
        res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details.'
        });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized.' });
    }
    next();
}

async function checkFullReferrals(userId) {
    // Check if the user has all six direct referrals
    const [userMembers] = await pool.query(
        `SELECT member1, member2, member3, member4, member5, member6 FROM genealogy WHERE user_id = ?`,
        [userId]
    );

    if (userMembers.length === 0) {
        return false; // User not found in genealogy
    }

    // Verify if all direct referrals (member1 through member6) are filled
    const directReferrals = Object.values(userMembers[0]);
    if (directReferrals.some(member => member === null)) {
        return false; // Not all direct referrals are filled
    }

    // Check if each of the direct referrals also has all six members filled
    for (let memberId of directReferrals) {
        const [nestedMembers] = await pool.query(
            `SELECT member1, member2, member3, member4, member5, member6 FROM genealogy WHERE user_id = ?`,
            [memberId]
        );

        if (nestedMembers.length === 0 || Object.values(nestedMembers[0]).some(nestedMember => nestedMember === null)) {
            return false; // Nested members are not fully filled
        }
    }

    return true; // All conditions are met
}

app.post('/user-topup', authenticateToken, async (req, res) => {
    try {
        const { userId, package } = req.body;
        const registrationFee = 5000;
        console.log(userId, package);

        if (!package || !userId) {
            return res.status(400).json({ message: 'Package and UserId fee information are required.' });
        }

        // Check if the user and their referrals are fully filled
        // const isEligibleForTopUp = await checkFullReferrals(userId);
        // if (!isEligibleForTopUp) {
        //     return res.status(403).json({ message: 'Top-up is not allowed. All members and their members must be filled.' });
        // }

        // Insert the top-up record into the database
        const [result] = await pool.query(
            'INSERT INTO user_topup (user_id, package) VALUES (?, ?)',
            [userId, package]
        );

        if (result.affectedRows === 1) {
            const [userData] = await pool.query(`SELECT introducer_id FROM users WHERE user_id = ?`, [userId]);

            if (userData.length > 0 && userData[0].introducer_id) {
                const referrerId = userData[0].introducer_id;

                // Calculate direct referral income (10% of registration fee)
                const directReferralIncome = registrationFee * 0.1;
                await creditDirectReferralIncome(referrerId, directReferralIncome, userId);

                // Handle re-birth income
                await handleRebirthIncome(userId);
            }

            // Send success email (Implementation below)
            sendTopupSuccessEmail(userId, package).then(() => {
                res.status(201).json({
                    message: 'Top-up successful!',
                    topup: {
                        user_id: userId,
                        package: package,
                    }
                });
            }).catch(error => {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Top-up successful, but email notification failed.' });
            });
        } else {
            res.status(500).json({ message: 'Failed to process top-up.' });
        }

    } catch (error) {
        console.error('Error during top-up:', error);
        res.status(500).json({ message: 'Top-up request failed. Please try again later.' });
    }
});

async function sendTopupSuccessEmail(userId, packageName) {
    try {
        const [user] = await pool.query('SELECT email, username FROM users WHERE user_id = ?', [userId]);
        const userEmail = user[0].email;

        const mailOptions = {
            from: 'dirssp2002@gmail.com',
            to: userEmail,
            subject: 'Aghan Promoters: Top-up Successful!',
            html: `
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <table width="600" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#000000">
                                        <div style="width: 100%; max-width: 600px; height: 100px; background-color: #091023; display: table;">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td align="start" style="width: 100%; height: 100%">
                                                        <img src="https://i.ibb.co/bvY6L8Y/aghan-logo-english.png" width="30%" style="display: block; margin: 0 auto" alt="Logo" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <div style="width: 100%; max-width: 600px; height: 500px; background-color: white; display: table;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 90px">
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 160%"><b>Congratulations, ${user[0].username}!</b></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 120%">Your Top-up is Successful</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <div style="color: black; text-align: center; font-size: 120%">
                                                Package Name :
                                                <span style="background-color: #f15529; color: white; padding: 5px; border-radius: 5px;"><b>${packageName}</b></span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="width: 60%; height: 100%">
                                            <p style="color: black; text-align: center; font-size: 120%">Enjoy our services</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff">
                            <div style="width: 100%; max-width: 600px; height: 100px; background-color: #39afa8; display: table; padding-bottom: 20px;">
                                <div>
                                    <p style="color: white; font-size: 150%"><b>JOIN OUR TEAM</b></p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 100%">Check our Aghan Promoters Blog for new publications</p>
                                </div>
                                <div>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr align="center">
                                            <td>
                                                <a href="https://www.facebook.com/profile.php?id=61557114009922"><img src="https://i.ibb.co/4Z0LDK9/1.png" width="8%" style="display: block; margin: 0 auto" alt="Logo" /></a>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 100%">Click here to share your Aghan Promoters story, photos, and videos with the world!</p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 160%"><b>AGHAN PROMOTERS LLP</b></p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 105%">NO.1/198, Middle Street, Kiliyur & Post, Ulundurpet Taluk,</p>
                                </div>
                                <div>
                                    <p style="color: white; font-size: 105%">Kallakurichi District, Tamilnadu, India - 606102</p>
                                </div>
                                <div style="padding-top: 20px">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr style="font-size: 100%" align="center">
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                                    <img src="https://i.ibb.co/cYMpqRK/8.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="tel:+917598818884">
                                                    <img src="https://i.ibb.co/0KPCM7c/9.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black" href="https://aghan.in/">
                                                    <img src="https://i.ibb.co/Sw9FdSc/10.png" width="30" height="30" alt="Logo" />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr style="font-size: 90%" align="center">
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black;" href="https://aghan.in/"><b>https://aghan.in/</b></a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <a style="text-decoration: none; color: black;" href="mailto:support@aghan.in"><b>support@aghan.in</b></a>
                                            </td>
                                            <td style="width: 33.33%">
                                                <br />
                                                <a style="text-decoration: none; color: black;" href="tel:+917598818884"><b>+91 75988 18884</b></a>
                                                <br />
                                                <a style="text-decoration: none; color: black;" href="tel:+917598818885"><b>+91 75988 18885</b></a>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            `
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

app.get('/sponsor-income', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const searchTerm = req.query.search || '';
        const offset = (page - 1) * pageSize;

        const [sponsorIncome] = await pool.query(`
            SELECT wt.TransactionID, wt.TransactionDate, wt.Amount, 
                   ru.username AS ReferralUsername, ru.user_id AS ReferralUserID,  -- Referral user details
                   u.username AS UserUsername, u.user_id AS UserID    -- User details (for clarity)
            FROM wallettransactions wt
            JOIN users u ON wt.UserID = u.user_id  
            LEFT JOIN users ru ON wt.ReferralID = ru.user_id   -- Join with users table for ReferralID
            WHERE wt.TransactionType = 'DIRECT_REFERRAL'
              AND wt.UserID = ?                
              AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.user_id) LIKE LOWER(?))
            ORDER BY wt.TransactionDate DESC
            LIMIT ? OFFSET ?
        `, [userId, `%${searchTerm}%`, `%${searchTerm}%`, pageSize, offset]);

        const [totalCountResult] = await pool.query(`
            SELECT COUNT(wt.TransactionID) AS total  
            FROM wallettransactions wt
            LEFT JOIN users u ON wt.UserID = u.user_id  
            WHERE wt.TransactionType = 'DIRECT_REFERRAL'
              AND wt.UserID = ?                     
              AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.user_id) LIKE LOWER(?) OR u.user_id IS NULL)

        `, [userId, `%${searchTerm}%`, `%${searchTerm}%`]);

        const totalCount = totalCountResult[0].total;

        res.json({
            sponsorIncome,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalCount: totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching sponsor income:', error);
        res.status(500).json({ message: 'Failed to fetch sponsor income' });
    }
});

app.get('/my-direct', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const searchTerm = req.query.search || '';
        const offset = (page - 1) * pageSize;

        const [directReferrals] = await pool.query(`
            SELECT u.user_id, u.username, u.mobile, u.status, u.created_at,
                   (SELECT COUNT(*) FROM genealogy g WHERE g.level1 = u.user_id) AS total_count, 
                   (SELECT COUNT(*) FROM users ru WHERE ru.introducer_id = u.user_id) AS ref_count
            FROM users u
            WHERE u.introducer_id = ?
              AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.user_id) LIKE LOWER(?))
            ORDER BY u.created_at DESC  -- Or any other relevant ordering
            LIMIT ? OFFSET ?
        `, [userId, `%${searchTerm}%`, `%${searchTerm}%`, pageSize, offset]);


        const [totalCountResult] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM users u
            WHERE u.introducer_id = ?
              AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.user_id) LIKE LOWER(?))
        `, [userId, `%${searchTerm}%`, `%${searchTerm}%`]);

        const totalCount = totalCountResult[0].total;

        res.json({
            directReferrals,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalCount: totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching direct referrals:', error);
        res.status(500).json({ message: 'Failed to fetch direct referrals' });
    }
});


app.get('/pending-fund-requests', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [requests] = await pool.query(
            'SELECT af.id, af.user_id, u.username, af.amount, af.transaction_id, af.created_at, af.status  FROM add_funds af JOIN users u ON af.user_id = u.user_id WHERE af.status = "pending"'
        );

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching pending fund requests:', error);
        res.status(500).json({ message: 'Failed to fetch pending fund requests.' });
    }
});

app.get('/approved-fund-requests', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [requests] = await pool.query(
            'SELECT af.id, af.user_id, u.username, af.amount, af.transaction_id, af.created_at, af.status  FROM add_funds af JOIN users u ON af.user_id = u.user_id WHERE af.status = "approved"'
        );

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching approved fund requests:', error);
        res.status(500).json({ message: 'Failed to fetch approved fund requests.' });
    }
});

app.get('/rejected-fund-requests', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [requests] = await pool.query(
            'SELECT af.id, af.user_id, u.username, af.amount, af.transaction_id, af.created_at, af.status  FROM add_funds af JOIN users u ON af.user_id = u.user_id WHERE af.status = "rejected"'
        );

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching rejected fund requests:', error);
        res.status(500).json({ message: 'Failed to fetch rejected fund requests.' });
    }
});

app.post('/approve-fund-request/:requestId', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const requestId = req.params.requestId;

        const [requestDetails] = await pool.query('SELECT * FROM add_funds WHERE id = ?', [requestId]);

        if (requestDetails.length === 0) {
            return res.status(404).json({ message: 'Fund request not found.' });
        }

        const request = requestDetails[0];
        const userId = request.user_id;
        const amount = parseFloat(request.amount);


        const [result] = await pool.query(
            'UPDATE add_funds SET status = "approved" WHERE id = ?',
            [requestId]
        );

        await pool.query('START TRANSACTION');

        try {
            // Update the fund request status to 'approved'
            const [updateResult] = await pool.query(
                'UPDATE add_funds SET status = "approved" WHERE id = ?',
                [requestId]
            );

            if (updateResult.affectedRows !== 1) {
                throw new Error('Failed to update fund request status.');
            }

            // Update the user's balance 
            const [balanceUpdateResult] = await pool.query(
                'UPDATE users SET balance = balance + ? WHERE user_id = ?',
                [amount, userId]
            );

            if (balanceUpdateResult.affectedRows !== 1) {
                throw new Error('Failed to update user balance.');
            }

            // Commit the transaction if both operations are successful
            await pool.query('COMMIT');

            res.json({ message: 'Fund request approved successfully!' });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error approving fund request:', error);
            res.status(500).json({ message: 'Failed to approve fund request.' });
        }
    } catch (error) {
        console.error('Error approving fund request:', error);
        res.status(500).json({ message: 'Failed to approve fund request.' });
    }
});

async function getRootUserId(userID) {
    try {
        const [rootUsers] = await pool.query(`SELECT user_id FROM users WHERE user_id = '${userID}'`);
        console.log("Root User ID:", rootUsers[0].user_id);
        return rootUsers.length > 0 ? rootUsers[0].user_id : null;
    } catch (error) {
        console.error('Error fetching root user ID:', error);
        throw error;
    }
}

app.post('/reject-fund-request/:requestId', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const requestId = req.params.requestId;

        const [result] = await pool.query(
            'UPDATE add_funds SET status = "rejected" WHERE id = ?',
            [requestId]
        );

        if (result.affectedRows === 1) {
            res.json({ message: 'Fund request rejected.' });
        } else {
            res.status(404).json({ message: 'Fund request not found.' });
        }

    } catch (error) {
        console.error('Error rejecting fund request:', error);
        res.status(500).json({ message: 'Failed to reject fund request.' });
    }
});

async function findReferrals(userId, level) {
    try {
        const referrals = [];
        const query = `SELECT user_id FROM genealogy WHERE 
                      level${level} = ?`;

        const [genealogyData] = await pool.query(query, [userId, userId, userId, userId, userId, userId]);

        genealogyData.forEach(row => {
            referrals.push(row.user_id);
        });

        return referrals;
    } catch (error) {
        console.error("Error fetching referrals:", error);
        throw error;
    }
}

function findNextFreeSlotAnywhere(genealogyTree, maxDepth = 5) {
    const queue = [genealogyTree]; // Start BFS traversal from the root

    while (queue.length > 0) {
        const currentNode = queue.shift(); // Get the next node in the queue

        // Check if this node has fewer than 6 children
        if (currentNode.children.length < 6) {
            return currentNode; // Found a free slot
        }

        // Enqueue the children to explore deeper levels
        for (const child of currentNode.children) {
            if (child.level <= maxDepth) {
                queue.push(child); // Continue to explore within the allowed levels
            }
        }
    }

    return null; // No free slot found within the max depth
}
// Helper functions to fetch username and email (replace with your actual logic)
async function getUserName(userId) {
    try {
        const [rows] = await pool.query('SELECT username FROM users WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0].username : 'Unknown User';
    } catch (error) {
        console.error('Error fetching username:', error);
        return 'Error fetching username';
    }
}

async function getUserEmail(userId) {
    try {
        const [rows] = await pool.query('SELECT email FROM users WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0].email : 'Unknown Email';
    } catch (error) {
        console.error('Error fetching email:', error);
        return 'Error fetching email';
    }
}

app.put('/update-personal', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedData = req.body;
        console.log("Update Request Body:", updatedData);

        // Dynamically build the SQL UPDATE statement
        const updateFields = [];
        for (const key in updatedData) {
            if (updatedData.hasOwnProperty(key)) {
                updateFields.push(`${key} = ?`);
            }
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
        const updateValues = [...Object.values(updatedData), userId];


        const [result] = await pool.query(updateQuery, updateValues);

        if (result.affectedRows === 1) {
            res.json({ message: 'Personal details updated successfully' });

        } else {
            res.status(404).json({ message: 'User not found or no data updated.' });
        }
    } catch (error) {
        console.error('Error updating personal details:', error);
        res.status(500).json({ message: 'Failed to update personal details.' });
    }
});

app.get('/logout', authenticateToken, (req, res) => {
    delete req.session.token;
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }

        res.json({ message: 'Logout successful' });
    });
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});