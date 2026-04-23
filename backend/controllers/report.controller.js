const db = require('../db/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Stats
        const productsCountRow = await db.getAsync('SELECT COUNT(*) as count FROM products');
        const usersCountRow = await db.getAsync('SELECT COUNT(*) as count FROM users');
        const ordersCountRow = await db.getAsync('SELECT COUNT(*) as count FROM orders');
        const revenueRow = await db.getAsync("SELECT SUM(total) as revenue FROM orders WHERE status = 'approved'");

        const stats = {
            products: productsCountRow.count || 0,
            users: usersCountRow.count || 0,
            orders: ordersCountRow.count || 0,
            revenue: revenueRow.revenue || 0
        };

        // 2. Recent Orders
        const recentOrdersRows = await db.allAsync('SELECT * FROM orders ORDER BY id DESC LIMIT 5');
        const recentOrders = [];
        for (const o of recentOrdersRows) {
            const user = await db.getAsync('SELECT id, fullName, username FROM users WHERE id = ?', [o.userId]);
            let items = [];
            try {
                if (o.items) items = JSON.parse(o.items);
            } catch (e) {}

            recentOrders.push({
                id: o.id,
                userId: o.userId,
                userName: user ? (user.fullName || user.username) : `User ID: ${o.userId}`,
                itemsSummary: items.map(i => i.name).join(', '),
                total: o.total,
                status: o.status,
                date: o.date
            });
        }

        // 3. Chart Data - Category Products
        const catStatsRows = await db.allAsync(`
            SELECT c.name, COUNT(p.id) as count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.categoryId 
            GROUP BY c.id
        `);
        const categoryChartLabels = [];
        const categoryChartData = [];
        for (let row of catStatsRows) {
            if (row.count > 0) {
                categoryChartLabels.push(row.name);
                categoryChartData.push(row.count);
            }
        }

        // 4. Chart Data - Monthly Revenue (Last 6 months)
        // For simplicity and matching frontend code exactly, we group in JS.
        const allApprovedOrders = await db.allAsync("SELECT date, total FROM orders WHERE status != 'cancelled'");
        
        const monthlyRevenue = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
            const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
            monthlyRevenue[`${monthNames[m.getMonth()]} ${m.getFullYear()}`] = 0;
        }

        for (const o of allApprovedOrders) {
            const date = new Date(o.date);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (monthlyRevenue[key] !== undefined) {
                monthlyRevenue[key] += o.total;
            } else if (Object.keys(monthlyRevenue).length < 12) {
                monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
            }
        }

        const revenueChartLabels = Object.keys(monthlyRevenue);
        const revenueChartData = Object.values(monthlyRevenue);

        res.json({
            stats,
            charts: {
                category: { labels: categoryChartLabels, data: categoryChartData },
                revenue: { labels: revenueChartLabels, data: revenueChartData }
            },
            recentOrders
        });

    } catch (error) {
        console.error("Report API error:", error);
        res.status(500).json({ detail: "Lỗi tải báo cáo: " + error.message });
    }
};
