"""Setup configuration for Everloop Story Engine."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="everloop",
    version="0.1.0",
    author="MarcMercury",
    description="A collaborative story universe where writers build within a living world — guided by AI, grounded in canon.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/MarcMercury/Everloop",
    packages=find_packages(exclude=["tests*"]),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Games/Entertainment",
        "Topic :: Artistic Software",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "flask>=3.0.0",
        "flask-cors>=4.0.0",
        "sqlalchemy>=2.0.23",
        "openai>=1.3.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.5.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-cov>=4.1.0",
            "black>=23.12.0",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
        ],
    },
    entry_points={
        "console_scripts": [
            "everloop-cli=everloop.cli:main",
            "everloop-api=everloop.api:main",
        ],
    },
)
