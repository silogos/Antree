#!/usr/bin/expect

set timeout 90

spawn pnpm db:generate

expect {
    "Is queue_items table created or renamed from another table?" {
        send "~ queue_items rename table\r"
        exp_continue
    }
}

expect {
    "Is queue_session_statuses table created or renamed from another table?" {
        send "~ queue_session_statuses rename table\r"
        exp_continue
    }
}

expect eof
