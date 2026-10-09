"""
Seed script: Insert mock users and 48 books into the database.
Run inside Docker: docker compose exec api python -m app.seed_books
"""
import asyncio
import uuid
from app.db.session import _get_session_factory
from app.models.user import User
from app.models.book import Book
from app.models.book_request import BookRequest
from app.models.order import Order
from app.core.security import hash_password
from sqlalchemy import select

MOCK_USERS = [
    {"username": "wanna_k", "email": "wanna@reread.com", "display_name": "วรรณา ก.", "avatar_url": "/avatar-wanna.png"},
    {"username": "poom_s", "email": "poom@reread.com", "display_name": "ภูมิ ส.", "avatar_url": "/avatar-poom.png"},
    {"username": "mint_r", "email": "mint@reread.com", "display_name": "มินต์", "avatar_url": "/avatar-mint.png"},
    {"username": "dao_r", "email": "dao@reread.com", "display_name": "ดาว ร.", "avatar_url": "/avatar-dao.png"},
    {"username": "nana_t", "email": "nana@reread.com", "display_name": "นานา ท.", "avatar_url": None},
]

MOCK_BOOKS = [
    {"title": "The Secret History", "author": "Donna Tartt", "condition": "Good", "cover_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzfQ_56EOBWIT45XDCquNAMmMIHIw0s551F3wS02HdWA&s=10", "tags": ["Fiction","Dark Academia","Mystery"], "status": "Available", "description": "Under the influence of their charismatic classics professor, a group of clever misfits discover a way of thinking that is a world away from the humdrum existence of their contemporaries."},
    {"title": "Norwegian Wood", "author": "Haruki Murakami", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600", "tags": ["Fiction","Japanese Literature","Romance"], "status": "Available", "description": "Toru, a quiet and serious young college student in Tokyo, is devoted to Naoko, but their mutual passion is marked by tragedy."},
    {"title": "Dune", "author": "Frank Herbert", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1531901599143-df5010ab9438?q=80&w=600", "tags": ["Sci-Fi","Classic","Out of Print"], "status": "Pending", "description": "Set on the desert planet Arrakis, Dune is the story of Paul Atreides, heir to a noble family tasked with ruling an inhospitable world."},
    {"title": "Pride and Prejudice", "author": "Jane Austen", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600", "tags": ["Classic","Romance"], "status": "Available", "description": "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language."},
    {"title": "1984", "author": "George Orwell", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600", "tags": ["Dystopian","Classic","Fiction"], "status": "Available", "description": "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its prophecies are fulfilled."},
    {"title": "Sapiens: A Brief History of Humankind", "author": "Yuval Noah Harari", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600", "tags": ["Non-Fiction","History","Science"], "status": "Available", "description": "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution."},
    {"title": "Atomic Habits", "author": "James Clear", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600", "tags": ["Self-Help","Psychology"], "status": "Available", "description": "No matter your goals, Atomic Habits offers a proven framework for improving—every day."},
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600", "tags": ["Classic","Fiction","American Literature"], "status": "Available", "description": "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan."},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=600", "tags": ["Classic","Fiction"], "status": "Pending", "description": "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it."},
    {"title": "Brave New World", "author": "Aldous Huxley", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=600", "tags": ["Dystopian","Sci-Fi","Classic"], "status": "Available", "description": "Aldous Huxley's profoundly important classic of world literature."},
    {"title": "The Alchemist", "author": "Paulo Coelho", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=600", "tags": ["Fiction","Philosophy","Adventure"], "status": "Available", "description": "Paulo Coelho's masterwork tells the mystical story of Santiago, an Andalusian shepherd boy."},
    {"title": "Crime and Punishment", "author": "Fyodor Dostoevsky", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=600", "tags": ["Classic","Fiction","Russian Literature"], "status": "Available", "description": "It is a murder story, told from the murderer's point of view, that implicates even the most innocent reader."},
    {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600", "tags": ["Non-Fiction","Psychology","Science"], "status": "Available", "description": "In this international bestseller, Daniel Kahneman explains the two systems that drive the way we think."},
    {"title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?q=80&w=600", "tags": ["Classic","Children","Philosophy"], "status": "Available", "description": "A poetic tale about a young prince who visits various planets in space, including Earth."},
    {"title": "Kafka on the Shore", "author": "Haruki Murakami", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1509266272358-7701da638078?q=80&w=600", "tags": ["Fiction","Japanese Literature","Surreal"], "status": "Available", "description": "Kafka on the Shore is powered by two remarkable characters: a teenage boy and an aging simpleton."},
    {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "condition": "Poor", "cover_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600", "tags": ["Classic","Fiction","Coming-of-Age"], "status": "Available", "description": "The hero-Loss of Holden Caulfield has been synonymous with youthful alienation and angst ever since."},
    {"title": "Educated", "author": "Tara Westover", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=600", "tags": ["Non-Fiction","Memoir","Education"], "status": "Available", "description": "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family."},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1472173148041-00294f0814a2?q=80&w=600", "tags": ["Fantasy","Classic","Adventure"], "status": "Available", "description": "Bilbo Baggins is a hobbit who enjoys a comfortable life, rarely traveling. But his contentment is disturbed."},
    {"title": "Fahrenheit 451", "author": "Ray Bradbury", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600", "tags": ["Dystopian","Sci-Fi","Classic"], "status": "Pending", "description": "Guy Montag is a fireman. His job is to destroy the most illegal of commodities, the printed book."},
    {"title": "The Power of Now", "author": "Eckhart Tolle", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600", "tags": ["Self-Help","Philosophy","Spirituality"], "status": "Available", "description": "Much more than simple principles, The Power of Now takes readers on a journey of discovery."},
    {"title": "Harry Potter and the Sorcerer's Stone", "author": "J.K. Rowling", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1618666012174-83b441a6a264?q=80&w=600", "tags": ["Fantasy","Young Adult","Adventure"], "status": "Available", "description": "Harry Potter has never even heard of Hogwarts when letters start arriving on the doorstep."},
    {"title": "A Brief History of Time", "author": "Stephen Hawking", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1462536943532-57a629f6cc60?q=80&w=600", "tags": ["Non-Fiction","Science","Physics"], "status": "Available", "description": "A landmark volume in science writing, exploring the universe's origins and eventual fate."},
    {"title": "One Hundred Years of Solitude", "author": "Gabriel García Márquez", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?q=80&w=600", "tags": ["Fiction","Magical Realism","Classic"], "status": "Available", "description": "The brilliant chronicle of the Buendía family and the town of Macondo."},
    {"title": "The Art of War", "author": "Sun Tzu", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=600", "tags": ["Non-Fiction","Philosophy","Strategy"], "status": "Available", "description": "Written in the fifth century BC, The Art of War remains the ultimate guide to combat strategy."},
    {"title": "Becoming", "author": "Michelle Obama", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600", "tags": ["Non-Fiction","Memoir","Biography"], "status": "Available", "description": "An intimate and powerful memoir by the former First Lady of the United States."},
    {"title": "The Midnight Library", "author": "Matt Haig", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600", "tags": ["Fiction","Fantasy","Contemporary"], "status": "Available", "description": "Between life and death there is a library filled with books of lives you could have lived."},
    {"title": "Frankenstein", "author": "Mary Shelley", "condition": "Poor", "cover_url": "https://images.unsplash.com/photo-1510172951991-856a62a9d7c3?q=80&w=600", "tags": ["Classic","Horror","Sci-Fi","Out of Print"], "status": "Available", "description": "The story of Victor Frankenstein's creation is as relevant today as when it was first published."},
    {"title": "The Road", "author": "Cormac McCarthy", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1415889455891-09cf0e53cd69?q=80&w=600", "tags": ["Fiction","Post-Apocalyptic","Literary"], "status": "Pending", "description": "A father and son walk alone through burned America heading toward the coast."},
    {"title": "Rich Dad Poor Dad", "author": "Robert T. Kiyosaki", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=600", "tags": ["Non-Fiction","Finance","Self-Help"], "status": "Available", "description": "What the rich teach their kids about money—that the poor and middle class do not!"},
    {"title": "Siddhartha", "author": "Hermann Hesse", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600", "tags": ["Fiction","Philosophy","Spirituality"], "status": "Available", "description": "Hermann Hesse's classic novel that has delighted and inspired readers for generations."},
    {"title": "The Name of the Wind", "author": "Patrick Rothfuss", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1535666669445-e8ace2132861?q=80&w=600", "tags": ["Fantasy","Fiction","Adventure"], "status": "Available", "description": "Told in Kvothe's own voice, this is the tale of the magically gifted young man."},
    {"title": "Quiet", "author": "Susan Cain", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=600", "tags": ["Non-Fiction","Psychology","Self-Help"], "status": "Available", "description": "The Power of Introverts in a World That Can't Stop Talking."},
    {"title": "The Kite Runner", "author": "Khaled Hosseini", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=600", "tags": ["Fiction","Literary","Drama"], "status": "Available", "description": "The unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father's servant."},
    {"title": "Meditations", "author": "Marcus Aurelius", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600", "tags": ["Non-Fiction","Philosophy","Classic","Out of Print"], "status": "Available", "description": "Written in the second century by the Roman Emperor Marcus Aurelius while on campaign."},
    {"title": "The Subtle Art of Not Giving a F*ck", "author": "Mark Manson", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1490633874781-1c63cc424610?q=80&w=600", "tags": ["Self-Help","Psychology","Humor"], "status": "Available", "description": "A refreshing slap in the face for a generation in need of a little tough love."},
    {"title": "Circe", "author": "Madeline Miller", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1543497415-75c0dfa5e6f7?q=80&w=600", "tags": ["Fiction","Mythology","Fantasy"], "status": "Available", "description": "In the house of Helios, god of the sun, a daughter is born: Circe."},
    {"title": "The Handmaid's Tale", "author": "Margaret Atwood", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600", "tags": ["Dystopian","Fiction","Feminist"], "status": "Available", "description": "In this multi-award-winning, bestselling novel, Offred tells her story of life in the Republic of Gilead."},
    {"title": "Sapiens: ประวัติย่อของมนุษยชาติ", "author": "ยูวัล โนอาห์ แฮรารี", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=600", "tags": ["Non-Fiction","History","Science"], "status": "Available", "description": "หนังสือที่เปลี่ยนมุมมองต่อประวัติศาสตร์ของเผ่าพันธุ์มนุษย์ตั้งแต่ยุคก่อนประวัติศาสตร์จนถึงปัจจุบัน"},
    {"title": "เพราะเราคู่กัน (2gether The Series)", "author": "JittiRain", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600", "tags": ["Fiction","Thai Novel","Romance"], "status": "Available", "description": "นิยายวาย BL ยอดฮิตที่ถูกนำมาสร้างเป็นซีรีส์ เรื่องราวความรักของไทน์และสารวัตร"},
    {"title": "คิดเป็น อยู่เป็น เย็นเป็นสุข", "author": "ว.วชิรเมธี", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600", "tags": ["Non-Fiction","Self-Help","Thai"], "status": "Available", "description": "หนังสือธรรมะที่อ่านง่ายและนำไปใช้ในชีวิตประจำวันได้จริง จากพระนักเขียนชื่อดัง"},
    {"title": "ฟ้าใสใจชื่น", "author": "ชลนิล", "condition": "New", "cover_url": "https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=600", "tags": ["Fiction","Thai Novel","Drama"], "status": "Available", "description": "นิยายรักดราม่าที่ได้รับความนิยมอย่างมากในหมู่นักอ่านชาวไทย"},
    {"title": "แฮร์รี่ พอตเตอร์กับศิลาอาถรรพ์", "author": "J.K. Rowling (แปลไทย)", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1618666012174-83b441a6a264?q=80&w=600", "tags": ["Fantasy","Thai","Young Adult"], "status": "Pending", "description": "ฉบับแปลไทยของ Harry Potter เล่มแรก สำหรับนักอ่านที่อยากอ่านเวอร์ชันภาษาไทย"},
    {"title": "โลกของโซฟี", "author": "Jostein Gaarder (แปลไทย)", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1535666669445-e8ace2132861?q=80&w=600", "tags": ["Fiction","Philosophy","Thai"], "status": "Available", "description": "นิยายปรัชญาระดับโลกที่ถูกแปลเป็นหลายสิบภาษา พาผู้อ่านเดินทางผ่านประวัติศาสตร์ปรัชญา"},
    {"title": "เดอะซีเคร็ต", "author": "รอนดา เบิร์น", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600", "tags": ["Self-Help","Thai","Spirituality"], "status": "Available", "description": "ฉบับแปลไทยของ The Secret หนังสือขายดีระดับโลกเกี่ยวกับกฎแห่งแรงดึงดูด"},
    {"title": "ลาว คำหอม", "author": "คำสิงห์ ศรีนอก", "condition": "Fair", "cover_url": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600", "tags": ["Classic","Thai Literature","Out of Print"], "status": "Available", "description": "รวมเรื่องสั้นชั้นเยี่ยมของวรรณกรรมไทย จากนักเขียนรางวัลซีไรต์"},
    {"title": "ไส้เดือนตาบอดในเขาวงกต", "author": "วีรพร นิติประภา", "condition": "Like New", "cover_url": "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=600", "tags": ["Fiction","Thai Literature","SEA Write Award"], "status": "Available", "description": "นวนิยายรางวัลซีไรต์ที่เล่าเรื่องราวผ่านมุมมองของผู้หญิงสองคนในยุคสมัยที่แตกต่างกัน"},
    {"title": "เกิดเป็นหมอ", "author": "หมอผจญภัย", "condition": "Good", "cover_url": "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=600", "tags": ["Non-Fiction","Thai","Memoir"], "status": "Available", "description": "เรื่องเล่าประสบการณ์จริงของหมอที่ทำงานในพื้นที่ห่างไกล ทั้งขำ ทั้งเศร้า ทั้งซึ้ง"},
]


async def seed():
    factory = _get_session_factory()
    async with factory() as session:
        # Check if already seeded
        result = await session.execute(select(Book))
        existing_books = list(result.scalars().all())
        if existing_books:
            needs_update = any(b.price is None for b in existing_books)
            if needs_update:
                for i, b in enumerate(existing_books):
                    if b.price is None:
                        listing_types = ["both", "sell", "both", "exchange"]
                        b.listing_type = listing_types[i % len(listing_types)]
                        if b.listing_type != "exchange":
                            b.price = float(120 + (i % 6) * 35)
                await session.commit()
                print(f"✅ Updated {len(existing_books)} existing books with sample prices and listing types!")
                return
            print("⚠️  Books already exist in DB with prices. Skipping seed.")
            return

        # Create mock users
        user_ids = []
        for u in MOCK_USERS:
            existing = await session.execute(select(User).where(User.username == u["username"]))
            user = existing.scalar_one_or_none()
            if not user:
                user = User(
                    username=u["username"],
                    email=u["email"],
                    password_hash=hash_password("Password1!"),
                    display_name=u["display_name"],
                    avatar_url=u["avatar_url"],
                )
                session.add(user)
                await session.flush()
                await session.refresh(user)
            user_ids.append(user.id)
        
        # Create books - distribute among users
        for i, b in enumerate(MOCK_BOOKS):
            owner_id = user_ids[i % len(user_ids)]
            listing_types = ["both", "sell", "both", "exchange"]
            l_type = listing_types[i % len(listing_types)]
            sample_price = float(120 + (i % 6) * 35) if l_type != "exchange" else None

            book = Book(
                title=b["title"],
                author=b["author"],
                cover_url=b["cover_url"],
                condition=b["condition"],
                description=b["description"],
                tags=b["tags"],
                status=b["status"],
                listing_type=l_type,
                price=sample_price,
                owner_id=owner_id,
            )
            session.add(book)
        
        await session.commit()
        print(f"✅ Seeded {len(MOCK_BOOKS)} books with {len(MOCK_USERS)} mock users!")


if __name__ == "__main__":
    asyncio.run(seed())
