import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../database/client';

export function setupPassport() {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'secret',
      },
      async (payload, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              avatar: true,
              isActive: true,
            },
          });

          if (!user || !user.isActive) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email from Google'), undefined);
            }

            let user = await prisma.user.findFirst({
              where: {
                OR: [
                  { googleId: profile.id },
                  { email },
                ],
              },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  googleId: profile.id,
                  email,
                  name: profile.displayName,
                  avatar: profile.photos?.[0]?.value,
                  isEmailVerified: true,
                },
              });
            } else if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id },
              });
            }

           return done(null, {
            ...user,
            avatar: user.avatar ?? undefined,
           });
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }
}
