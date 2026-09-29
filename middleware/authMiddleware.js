const {
    adminAuth
} = require("../firebaseAdmin");


// =====================================
// PROTECTED PAGE
// =====================================

async function requirePageAuth(
    req,
    res,
    next
) {

    try {

        const sessionCookie =
            req.cookies.__session;


        if (!sessionCookie) {

            return res.redirect(
                "/login"
            );

        }


        const decodedClaims =
            await adminAuth.verifySessionCookie(
                sessionCookie,
                true
            );


        req.firebaseUser =
            decodedClaims;


        next();


    } catch (error) {

        console.error(
            "PAGE AUTH ERROR:",
            error.message
        );


        res.clearCookie(
            "__session",
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            }
        );


        return res.redirect(
            "/login"
        );

    }

}


// =====================================
// PROTECTED API
// =====================================

async function requireApiAuth(
    req,
    res,
    next
) {

    try {

        const sessionCookie =
            req.cookies.__session;


        if (!sessionCookie) {

            return res.status(401).json({

                error:
                    "Please login to use Smart Academic AI."

            });

        }


        const decodedClaims =
            await adminAuth.verifySessionCookie(
                sessionCookie,
                true
            );


        req.firebaseUser =
            decodedClaims;


        next();


    } catch (error) {

        console.error(
            "API AUTH ERROR:",
            error.message
        );


        return res.status(401).json({

            error:
                "Your session has expired. Please login again."

        });

    }

}


module.exports = {
    requirePageAuth,
    requireApiAuth
};