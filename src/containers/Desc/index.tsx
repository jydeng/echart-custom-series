import ReactMarkdown from 'react-markdown';
import content from './content.md';
import './style.css';


const Desc = () => (
    <div className="desc">
        <ReactMarkdown>{content}</ReactMarkdown>
    </div>
)
export default Desc;