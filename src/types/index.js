// Type definitions for CodeHero platform
// These are JSDoc comments for better IDE support

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {'user' | 'mentor'} role
 * @property {number} level
 * @property {number} experience
 * @property {number} streak
 * @property {number} rating
 * @property {Badge[]} badges
 * @property {Date} joinedAt
 * @property {number} contributionPoints
 */

/**
 * @typedef {Object} Doubt
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 * @property {'easy' | 'medium' | 'hard'} difficulty
 * @property {string} createdBy
 * @property {Date} createdAt
 * @property {'open' | 'solved' | 'closed'} status
 * @property {Solution[]} solutions
 * @property {number} bounty
 */

/**
 * @typedef {Object} Solution
 * @property {string} id
 * @property {string} doubtId
 * @property {string} content
 * @property {string} createdBy
 * @property {Date} createdAt
 * @property {number} upvotes
 * @property {boolean} isAccepted
 */

/**
 * @typedef {Object} MentorshipSession
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} mentorId
 * @property {string} mentorName
 * @property {Date} scheduledAt
 * @property {number} duration
 * @property {number} capacity
 * @property {string[]} attendees
 * @property {string[]} tags
 * @property {'upcoming' | 'ongoing' | 'completed' | 'cancelled'} status
 * @property {string} [meetingLink]
 */

/**
 * @typedef {Object} Contest
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Date} startTime
 * @property {Date} endTime
 * @property {'beginner' | 'intermediate' | 'advanced'} difficulty
 * @property {Participant[]} participants
 * @property {Problem[]} problems
 * @property {'upcoming' | 'ongoing' | 'completed'} status
 */

/**
 * @typedef {Object} Problem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'easy' | 'medium' | 'hard'} difficulty
 * @property {number} points
 * @property {TestCase[]} testCases
 */

/**
 * @typedef {Object} TestCase
 * @property {string} input
 * @property {string} expectedOutput
 */

/**
 * @typedef {Object} Participant
 * @property {string} userId
 * @property {string} userName
 * @property {number} score
 * @property {Submission[]} submissions
 * @property {number} rank
 */

/**
 * @typedef {Object} Submission
 * @property {string} problemId
 * @property {string} code
 * @property {string} language
 * @property {'accepted' | 'wrong-answer' | 'time-limit' | 'runtime-error'} status
 * @property {Date} submittedAt
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} createdBy
 * @property {string} creatorName
 * @property {string} [thumbnail]
 * @property {'beginner' | 'intermediate' | 'advanced'} difficulty
 * @property {number} duration
 * @property {Chapter[]} chapters
 * @property {string[]} enrolledUsers
 * @property {number} rating
 * @property {Review[]} reviews
 * @property {number} price
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [videoUrl]
 * @property {string} content
 * @property {number} order
 * @property {Resource[]} resources
 */

/**
 * @typedef {Object} Resource
 * @property {string} id
 * @property {string} title
 * @property {'pdf' | 'link' | 'code' | 'assignment'} type
 * @property {string} url
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {number} rating
 * @property {string} comment
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Badge
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {Date} earnedAt
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} userId
 * @property {'doubt_created' | 'doubt_solved' | 'session_hosted' | 'session_attended' | 'contest_participated' | 'course_created' | 'course_completed'} type
 * @property {string} description
 * @property {number} points
 * @property {Date} createdAt
 * @property {string} [relatedId]
 */

export {};