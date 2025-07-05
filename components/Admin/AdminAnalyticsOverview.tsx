
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalytics, fetchAllBlogs } from '../../services/adminService';
import LoadingSpinner from '../Common/LoadingSpinner';
import { TotalStats, TopPostStat, TimeSeriesDataPoint, TopAuthorStat } from '../../types';
import { UsersIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, ArrowTrendingUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
        <div className="bg-brand-bg dark:bg-brand-surface-dark p-3 rounded-full">
            <Icon className="h-7 w-7 text-brand-text dark:text-brand-text-dark" />
        </div>
        <div>
            <p className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">{value}</p>
            <p className="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">{title}</p>
        </div>
    </div>
);


const AdminAnalyticsOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [topPosts, setTopPosts] = useState<TopPostStat[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopAuthorStat[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [backendStats, allBlogs] = await Promise.all([
        fetchAnalytics(),
        fetchAllBlogs()
      ]);
      // Compute top posts by reactions length
      const topPostsData = [...allBlogs]
        .map(b=>({
          postId: b.id,
          title: b.title,
          engagementScore: Object.values(b.reactions||{}).reduce((sum,users)=>sum+(users?.length||0),0)
        }))
        .sort((a,b)=>b.engagementScore-a.engagementScore)
        .slice(0,5);
      // top authors by engagement
      const authorMap: Record<string,{authorName:string,totalEngagement:number,authorId:string}> = {};
      allBlogs.forEach(b=>{
        const score=Object.values(b.reactions||{}).reduce((s,u)=>s+(u?.length||0),0);
        const id=b.authorId;
        if(!authorMap[id]) authorMap[id]={authorName:b.authorName||'Unknown',totalEngagement:0,authorId:id};
        authorMap[id].totalEngagement+=score;
      });
      const topAuthorsData = Object.values(authorMap).sort((a,b)=>b.totalEngagement-a.totalEngagement).slice(0,5);
      // timeseries simple by createdAt cumulative counts last 30 days
      const today=new Date();
      const dates:Array<{date:string,users:number,posts:number}>=[];
      for(let i=29;i>=0;i--){
        const d=new Date(today);
        d.setDate(today.getDate()-i);
        const dateStr=d.toISOString().split('T')[0];
        dates.push({date:dateStr,users:0,posts:0});
      }
      allBlogs.forEach(b=>{const date=b.createdAt.split('T')[0]; const idx=dates.findIndex(d=>d.date===date); if(idx!==-1){ for(let j=idx;j<dates.length;j++){dates[j].posts++;}}});
      // cannot get users per date without endpoint skip
      setStats(backendStats);
      setTopPosts(topPostsData);
      setTopAuthors(topAuthorsData);
      setTimeSeries(dates);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setLoading(false);
  }, []);

  useEffect(()=>{loadAnalytics();},[loadAnalytics]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics data..." />;
  }

  if (!stats) {
    return <p className="text-red-500 dark:text-red-400">Could not load analytics data.</p>;
  }


  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-semibold text-brand-text dark:text-brand-text-dark">Analytics Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={UsersIcon} color="border-blue-500" />
        <StatCard title="Total Posts" value={stats.totalBlogs} icon={DocumentTextIcon} color="border-green-500" />
        <StatCard title="Published Blogs" value={stats.publishedBlogs} icon={ChatBubbleLeftEllipsisIcon} color="border-yellow-500" />
        <StatCard title="Draft Blogs" value={stats.draftBlogs} icon={SparklesIcon} color="border-purple-500" />
      </div>

      <div className="bg-brand-surface dark:bg-brand-surface-dark p-4 sm:p-6 rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
        <h4 className="text-xl font-semibold text-brand-text dark:text-brand-text-dark mb-4 flex items-center">
          <ArrowTrendingUpIcon className="h-6 w-6 text-brand-accent dark:text-brand-accent-dark mr-2" />
          Platform Growth (Last 30 Days)
        </h4>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={timeSeries} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)"/>
              <XAxis dataKey="date" tick={{fill: 'var(--chart-text-color)', fontSize: 12}} />
              <YAxis allowDecimals={false} tick={{fill: 'var(--chart-text-color)', fontSize: 12}}/>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--chart-tooltip-bg)', 
                  color: 'var(--chart-tooltip-text)', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--chart-grid-color)' 
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--chart-legend-text)' }} />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Cumulative Users" />
              <Area type="monotone" dataKey="posts" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Cumulative Posts"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface dark:bg-brand-surface-dark p-4 sm:p-6 rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
          <h4 className="text-xl font-semibold text-brand-text dark:text-brand-text-dark mb-4">Top Content</h4>
          {topPosts.length > 0 ? (
            <ul className="divide-y divide-brand-border dark:divide-brand-border-dark">
                {topPosts.map(post => (
                    <li key={post.postId} className="py-3 flex items-center justify-between">
                        <Link to={`/blog/${post.postId}`} className="text-sm font-medium text-brand-accent dark:text-brand-accent-dark hover:underline line-clamp-1 flex-1 pr-4" title={post.title}>
                            {post.title}
                        </Link>
                        <span className="text-sm font-semibold text-brand-text dark:text-brand-text-dark bg-brand-bg dark:bg-brand-bg-dark px-2 py-1 rounded-md">{post.engagementScore} pts</span>
                    </li>
                ))}
            </ul>
          ) : <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-sm">No post data to display.</p>}
        </div>
        
        <div className="bg-brand-surface dark:bg-brand-surface-dark p-4 sm:p-6 rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
          <h4 className="text-xl font-semibold text-brand-text dark:text-brand-text-dark mb-4">Top Authors</h4>
           {topAuthors.length > 0 ? (
            <ul className="space-y-3">
                {topAuthors.map(author => (
                    <li key={author.authorId} className="flex items-center justify-between">
                        <Link to={`/author/${author.authorId}`} className="flex items-center space-x-3 group">
                            <img src={author.profilePictureUrl || DEFAULT_PROFILE_PICTURE} alt={author.authorName} className="h-9 w-9 rounded-full object-cover"/>
                            <span className="text-sm font-medium text-brand-text dark:text-brand-text-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors">{author.authorName}</span>
                        </Link>
                         <span className="text-sm font-semibold text-brand-text dark:text-brand-text-dark bg-brand-bg dark:bg-brand-bg-dark px-2 py-1 rounded-md">{author.totalEngagement} pts</span>
                    </li>
                ))}
            </ul>
          ) : <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-sm">No author data to display.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
